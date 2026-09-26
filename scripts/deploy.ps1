<#
.SYNOPSIS
  One-command deploy: commit locally -> push to GitHub -> update the VPS.

.DESCRIPTION
  1. Commits any uncommitted changes (asks for a message if -Message isn't given).
  2. Runs checks on what changed: frontend vitest, backend `node --check`.
  3. Rebases onto origin/main if GitHub is ahead, then pushes.
     GitHub Actions (deploy-frontend.yml) rebuilds the website from that push.
  4. If anything under backend/ changed (or -ForceVps), SSHes to the VPS:
     git pull, npm ci (only when package-lock.json changed), pm2 restart.
  5. Checks the API health endpoint and prints the frontend deploy run.

  Database migrations (supabase/migrations) and infra/ files are NEVER applied
  automatically. The script lists them and prints the command to run by hand.

.EXAMPLE
  .\scripts\deploy.ps1 -Message "fix(generation): relax word-count floor"
  .\scripts\deploy.ps1                 # prompts for a commit message if needed
  .\scripts\deploy.ps1 -SkipTests      # skip vitest / node --check
  .\scripts\deploy.ps1 -ForceVps       # pull + restart on the VPS even with no backend change
  .\scripts\deploy.ps1 -NoVps          # GitHub only

  First-time setup: see scripts/deploy.local.env.example.
#>
param(
  [string]$Message,
  [switch]$SkipTests,
  [switch]$ForceVps,
  [switch]$NoVps
)

$ErrorActionPreference = 'Continue'  # native tools are judged by $LASTEXITCODE, not stderr
$RepoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $RepoRoot

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Info($text) { Write-Host "    $text" -ForegroundColor Gray }
function Warn($text) { Write-Host "    ! $text" -ForegroundColor Yellow }
function Fail($text) { Write-Host "`nX $text" -ForegroundColor Red; exit 1 }
# git writes warnings (e.g. LF->CRLF) to stderr; under 'Stop' PowerShell 5.1
# turns those into terminating errors when output is redirected. Judge git by
# its exit code only.
function Invoke-Git {
  $ErrorActionPreference = 'Continue'
  & git.exe @args 2>&1 | ForEach-Object { "$_" } | Where-Object { $_ -notmatch '^warning: in the working copy' }
  if ($LASTEXITCODE -ne 0) { Fail "git $($args -join ' ') failed" }
}

# ── Config (VPS connection details live in an untracked local file) ──────────
$Config = @{
  VPS_USER   = 'root'
  VPS_DIR    = '/opt/fasttypinglab'
  PM2_APP    = 'fasttypinglab-api'
  API_HEALTH = 'https://api.fasttypinglab.com/health'
  BRANCH     = 'main'
}
$ConfigFile = Join-Path $PSScriptRoot 'deploy.local.env'
if (Test-Path $ConfigFile) {
  foreach ($line in Get-Content $ConfigFile) {
    if ($line -match '^\s*([A-Z_]+)\s*=\s*(.*?)\s*$') { $Config[$Matches[1]] = $Matches[2] }
  }
}
$Branch = $Config.BRANCH

# ── 1. Commit local changes ───────────────────────────────────────────────────
Step 'Local commit'
$current = (& git rev-parse --abbrev-ref HEAD).Trim()
if ($current -ne $Branch) { Fail "You are on '$current'. Switch to '$Branch' first." }

$dirty = & git status --porcelain
if ($dirty) {
  & git status --short
  if (-not $Message) { $Message = Read-Host '    Commit message' }
  if (-not $Message) { Fail 'A commit message is required.' }
  Invoke-Git add -A
  # Belt and braces: never commit an env/secret file even if .gitignore misses it.
  $secrets = & git diff --cached --name-only | Where-Object { $_ -match '(^|/)\.env(\.|$)|deploy\.local\.env$|\.pem$|_key$' }
  if ($secrets) { & git reset -q; Fail "Refusing to commit secret-looking files:`n    $($secrets -join "`n    ")" }
  Invoke-Git commit -q -m $Message
  Info "Committed: $Message"
} else {
  Info 'Working tree clean - nothing to commit.'
}

# ── 2. Sync with GitHub and work out what's new ───────────────────────────────
Step 'Sync with GitHub'
Invoke-Git fetch -q origin $Branch
$behind = [int](& git rev-list --count "HEAD..origin/$Branch")
if ($behind -gt 0) {
  Info "GitHub is $behind commit(s) ahead - rebasing on top."
  & git rebase "origin/$Branch"
  if ($LASTEXITCODE -ne 0) { & git rebase --abort; Fail 'Rebase hit a conflict. Resolve it manually, then re-run.' }
}
$ahead = [int](& git rev-list --count "origin/$Branch..HEAD")
$changed = @()
if ($ahead -gt 0) { $changed = @(& git diff --name-only "origin/$Branch..HEAD") }
Info "$ahead commit(s) to push, $($changed.Count) file(s) changed."

$frontendChanged = @($changed | Where-Object { $_ -like 'frontend/*' }).Count -gt 0
$backendFiles    = @($changed | Where-Object { $_ -like 'backend/*' })
$lockChanged     = $changed -contains 'backend/package-lock.json'
$migrations      = @($changed | Where-Object { $_ -like 'supabase/migrations/*.sql' })
$infraFiles      = @($changed | Where-Object { $_ -like 'infra/*' })

# ── 3. Checks ─────────────────────────────────────────────────────────────────
if (-not $SkipTests -and $ahead -gt 0) {
  Step 'Checks'
  if ($frontendChanged) {
    Info 'Frontend changed - running vitest...'
    & npm --prefix frontend run test --silent
    if ($LASTEXITCODE -ne 0) { Fail 'Frontend tests failed. Nothing was pushed (your commit is still local).' }
  }
  foreach ($f in $backendFiles | Where-Object { $_ -like '*.js' -and (Test-Path $_) }) {
    & node --check $f
    if ($LASTEXITCODE -ne 0) { Fail "Syntax error in $f. Nothing was pushed." }
  }
  if ($backendFiles.Count) { Info "node --check passed on backend files." }
}

# ── 4. Push to GitHub ─────────────────────────────────────────────────────────
if ($ahead -gt 0) {
  Step 'Push to GitHub'
  Invoke-Git push -q origin $Branch
  Info 'Pushed.'
  if ($frontendChanged) { Info 'Frontend changed - GitHub Actions is rebuilding the website.' }
} else {
  Info 'GitHub is already up to date.'
}

# ── 5. Update the VPS ─────────────────────────────────────────────────────────
$needVps = ($backendFiles.Count -gt 0) -or $ForceVps
if ($NoVps) {
  if ($backendFiles.Count) { Warn 'Backend changed but -NoVps was given - the VPS is NOT updated.' }
} elseif ($needVps) {
  Step 'Update VPS'
  if (-not $Config.VPS_HOST) { Fail "VPS_HOST is not set. Copy scripts/deploy.local.env.example to scripts/deploy.local.env and fill it in." }

  $sshArgs = @('-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15')
  if ($Config.VPS_KEY) { $sshArgs += @('-i', $Config.VPS_KEY) }
  if ($Config.VPS_PORT) { $sshArgs += @('-p', $Config.VPS_PORT) }
  $target = "$($Config.VPS_USER)@$($Config.VPS_HOST)"

  $install = if ($lockChanged) { " && cd backend && npm ci --omit=dev && cd .." } else { '' }
  $remote = "set -e; cd $($Config.VPS_DIR) && git pull --ff-only$install && pm2 restart $($Config.PM2_APP) --update-env && pm2 status $($Config.PM2_APP) --no-color | tail -n 4"
  Info "ssh $target"
  & ssh @sshArgs $target $remote
  if ($LASTEXITCODE -ne 0) { Fail 'VPS update failed (see output above). GitHub push already succeeded.' }

  Step 'API health check'
  $ok = $false
  for ($i = 1; $i -le 6 -and -not $ok; $i++) {
    Start-Sleep -Seconds 3
    try {
      $r = Invoke-WebRequest -Uri $Config.API_HEALTH -UseBasicParsing -TimeoutSec 10
      if ($r.StatusCode -eq 200) { $ok = $true; Info "Healthy ($($Config.API_HEALTH))" }
    } catch { Info "attempt $i - not up yet" }
  }
  if (-not $ok) { Fail "API did not come back healthy. On the VPS run: pm2 logs $($Config.PM2_APP) --lines 50 --nostream" }
} else {
  Info 'No backend changes - VPS left alone (use -ForceVps to pull + restart anyway).'
}

# ── 6. Things that must be done by hand ───────────────────────────────────────
if ($migrations.Count) {
  Step 'Database migrations NOT applied automatically'
  foreach ($m in $migrations) {
    $name = Split-Path $m -Leaf
    Warn $name
    Info "run on VPS: docker exec -i postgres psql -U postgres -d fasttypinglab < $($Config.VPS_DIR)/$m"
  }
}
if ($infraFiles.Count) {
  Step 'infra/ files changed - copy/reload them on the VPS by hand'
  $infraFiles | ForEach-Object { Warn $_ }
}

if ($frontendChanged -and (Get-Command gh -ErrorAction SilentlyContinue)) {
  Step 'Website deploy (GitHub Actions)'
  & gh run list --workflow deploy-frontend.yml --limit 1
  Info 'Follow it live with: gh run watch'
}

Write-Host "`nDone." -ForegroundColor Green
