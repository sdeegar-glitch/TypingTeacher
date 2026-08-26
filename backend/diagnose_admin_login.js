import { supabase } from './supabaseClient.js';

// Local diagnostic — replicates exactly what the backend does on admin login:
// sign in, then look up the users-table row by the resulting auth user id.
// Prints each step so we can see precisely where it breaks. Nothing is sent
// anywhere else; your password stays local to this script.
//
// Run as:
//   DIAG_EMAIL=admin@typingteacher.com DIAG_PASSWORD=<your current password> node diagnose_admin_login.js

async function diagnose() {
  const email = process.env.DIAG_EMAIL;
  const password = process.env.DIAG_PASSWORD;
  if (!email || !password) {
    console.error('Set DIAG_EMAIL and DIAG_PASSWORD environment variables before running this script.');
    process.exit(1);
  }

  console.log(`\n1) Signing in as ${email}...`);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.log('   ❌ Sign-in failed:', error.message);
    return;
  }
  console.log('   ✅ Sign-in succeeded. Auth user id:', data.user.id);

  console.log('\n2) Looking up users table row by that exact id...');
  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('id, email, role, is_banned, totp_enabled')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileErr) {
    console.log('   ❌ Query error:', profileErr.message);
    return;
  }
  if (!profile) {
    console.log('   ❌ NO ROW FOUND for id', data.user.id, '— the users table has no row with this exact id.');
    console.log('      This is the bug: the auth user and the users-table row are not linked by id.');

    console.log('\n3) Checking if a row exists for this EMAIL instead (possibly with a different id)...');
    const { data: byEmail } = await supabase.from('users').select('id, email, role').eq('email', email);
    if (byEmail && byEmail.length) {
      console.log('   Found row(s) by email:', JSON.stringify(byEmail));
      console.log('   -> Compare the id above to the auth user id from step 1 — if they differ, that mismatch is the root cause.');
    } else {
      console.log('   No row found by email either.');
    }
    return;
  }

  console.log('   Row found:', JSON.stringify(profile));
  if (profile.role !== 'admin') {
    console.log(`   ❌ role is "${profile.role}", not "admin" — that's why access is denied.`);
  } else if (profile.is_banned) {
    console.log('   ❌ Account is marked is_banned — login is blocked before the role check even matters.');
  } else {
    console.log('   ✅ role is admin and not banned — this account SHOULD pass requireAdmin. If the site still rejects it, it may be serving an old deploy — try again in a minute.');
  }
}

diagnose();
