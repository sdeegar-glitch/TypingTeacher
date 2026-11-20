#!/usr/bin/env python3
"""
validation-checker.py — Frontend Build & Accessibility Verification Harness.
Part of the ai-slop-remover skill suite.

Runs:
1. Framework build / typecheck commands (npm run build, tsc --noEmit, etc.).
2. Test runner execution (npm test, vitest run).
3. Contrast ratio validator for theme color tokens.

Usage:
    python validation-checker.py <project-dir> [--skip-build] [--skip-tests] [--json]
"""

import os
import sys
import json
import subprocess
import argparse
import math
from pathlib import Path

def calculate_luminance(r: int, g: int, b: int) -> float:
    def adjust(c: float) -> float:
        c = c / 255.0
        return c / 12.92 if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4)
    return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)

def contrast_ratio(hex1: str, hex2: str) -> float:
    def hex_to_rgb(h: str):
        h = h.lstrip('#')
        if len(h) == 3:
            h = ''.join([c*2 for c in h])
        return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)

    try:
        r1, g1, b1 = hex_to_rgb(hex1)
        r2, g2, b2 = hex_to_rgb(hex2)
        l1 = calculate_luminance(r1, g1, b1)
        l2 = calculate_luminance(r2, g2, b2)
        lighter = max(l1, l2)
        darker = min(l1, l2)
        return round((lighter + 0.05) / (darker + 0.05), 2)
    except Exception:
        return 1.0

def run_cmd(cmd_list: list, cwd: Path) -> dict:
    try:
        proc = subprocess.run(
            cmd_list,
            cwd=cwd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=120,
            shell=True
        )
        return {
            'command': ' '.join(cmd_list),
            'exit_code': proc.returncode,
            'success': proc.returncode == 0,
            'stdout': proc.stdout[-1500:] if proc.stdout else '',
            'stderr': proc.stderr[-1500:] if proc.stderr else ''
        }
    except Exception as e:
        return {
            'command': ' '.join(cmd_list),
            'exit_code': -1,
            'success': False,
            'error': str(e)
        }

def main():
    parser = argparse.ArgumentParser(description="Build, Test & Contrast Verification Harness")
    parser.add_argument("project_path", type=str, help="Project directory")
    parser.add_argument("--skip-build", action="store_true", help="Skip running npm build")
    parser.add_argument("--skip-tests", action="store_true", help="Skip running unit tests")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")

    args = parser.parse_args()
    proj = Path(args.project_path).resolve()

    # Determine if frontend subdirectory exists
    work_dir = proj / 'frontend' if (proj / 'frontend' / 'package.json').exists() else proj

    results = {
        'target_directory': str(work_dir),
        'checks': {}
    }

    # 1. Typecheck
    if not args.skip_build and (work_dir / 'tsconfig.json').exists():
        print("Validating TypeScript types (`npx tsc --noEmit`)...")
        results['checks']['typecheck'] = run_cmd(['npx', 'tsc', '--noEmit'], work_dir)

    # 2. Build
    if not args.skip_build and (work_dir / 'package.json').exists():
        print("Executing project build test (`npm run build`)...")
        results['checks']['build'] = run_cmd(['npm', 'run', 'build'], work_dir)

    # 3. Unit tests
    if not args.skip_tests and (work_dir / 'package.json').exists():
        print("Executing test runner (`npm test`)...")
        results['checks']['tests'] = run_cmd(['npm', 'test'], work_dir)

    # 4. Built-in token contrast benchmark
    token_checks = [
        {'name': 'Light Mode Body Text on Surface', 'fg': '#1C1917', 'bg': '#FBFBFA', 'min': 4.5},
        {'name': 'Light Mode Muted Text on Surface', 'fg': '#57534E', 'bg': '#FBFBFA', 'min': 4.5},
        {'name': 'Dark Mode Body Text on Surface', 'fg': '#F2F4F8', 'bg': '#0C0F14', 'min': 4.5},
        {'name': 'Dark Mode Muted Text on Surface', 'fg': '#9DA7B8', 'bg': '#0C0F14', 'min': 4.5},
        {'name': 'Primary Button Text on Primary Red Accent', 'fg': '#FFFFFF', 'bg': '#9B381E', 'min': 4.5},
    ]

    contrast_results = []
    for tc in token_checks:
        ratio = contrast_ratio(tc['fg'], tc['bg'])
        passed = ratio >= tc['min']
        contrast_results.append({
            'name': tc['name'],
            'foreground': tc['fg'],
            'background': tc['bg'],
            'contrast_ratio': f"{ratio}:1",
            'required_min': f"{tc['min']}:1",
            'wcag_aa_passed': passed
        })
    results['checks']['token_contrast_samples'] = contrast_results

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print("\n================ VALIDATION REPORT ================")
        for check_name, res in results['checks'].items():
            if check_name == 'token_contrast_samples':
                print("\n[WCAG 2.2 AA Contrast Ratios]:")
                for cr in res:
                    status = "✅ PASS" if cr['wcag_aa_passed'] else "❌ FAIL"
                    print(f"  {status} {cr['name']}: {cr['contrast_ratio']} (Required: {cr['required_min']})")
            else:
                status = "✅ SUCCESS" if res.get('success') else "❌ FAILURE"
                print(f"\n[{check_name.upper()}]: {status}")
                if not res.get('success') and 'stderr' in res:
                    print(f"  Details: {res['stderr'].strip()[:300]}")
        print("===================================================\n")

if __name__ == '__main__':
    main()

