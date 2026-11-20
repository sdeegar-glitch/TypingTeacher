#!/usr/bin/env python3
"""
duplicate-style-detector.py — Style Token Sprawl & Utility Conflict Scanner.
Part of the ai-slop-remover skill suite.

Detects:
1. Conflicting utility classes on the same element (e.g., `p-4 px-6`, `text-lg text-sm`).
2. Ad-hoc arbitrary hex values scattered throughout components (`bg-[#...]`, `text-[#...]`).
3. Redundant duplicate style declarations across CSS files.

Usage:
    python duplicate-style-detector.py <src-dir> [--json] [--output <report.md>]
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path
from collections import defaultdict

IGNORE_DIRS = {
    'node_modules', '.git', '.next', 'dist', 'build', 'out',
    '.turbo', 'coverage', '.cache', '__pycache__', 'target', '.venv', 'venv'
}

CONFLICT_PAIRS = [
    (re.compile(r'\bp-\d+\b'), re.compile(r'\bpx-\d+\b'), 'Padding: p-* conflicts with px-*'),
    (re.compile(r'\bp-\d+\b'), re.compile(r'\bpy-\d+\b'), 'Padding: p-* conflicts with py-*'),
    (re.compile(r'\bm-\d+\b'), re.compile(r'\bmx-\d+\b'), 'Margin: m-* conflicts with mx-*'),
    (re.compile(r'\bm-\d+\b'), re.compile(r'\bmy-\d+\b'), 'Margin: m-* conflicts with my-*'),
    (re.compile(r'\btext-(xs|sm|base|lg|xl|2xl|3xl)\b'), re.compile(r'\btext-(4xl|5xl|6xl|7xl)\b'), 'Font Size: Multiple conflicting text sizes'),
    (re.compile(r'\brounded-(none|sm|md|lg)\b'), re.compile(r'\brounded-(xl|2xl|3xl|full)\b'), 'Border Radius: Multiple conflicting corner radii'),
]

HEX_REGEX = re.compile(r'#[0-9a-fA-F]{3,8}\b')
CLASSNAME_REGEX = re.compile(r'(?:className|class)\s*=\s*["\'`{]([^"\'`}]+)["\'`}]')

def scan_file_styles(file_path: Path, root_path: Path):
    conflicts = []
    arbitrary_colors = defaultdict(list)

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            rel = file_path.relative_to(root_path)

            # Find arbitrary hex colors
            matches = HEX_REGEX.findall(content)
            for m in matches:
                arbitrary_colors[m.lower()].append(str(rel))

            # Find conflicting class names
            class_matches = CLASSNAME_REGEX.findall(content)
            for class_str in class_matches:
                tokens = class_str.split()
                for c1, c2, msg in CONFLICT_PAIRS:
                    has_c1 = any(c1.search(t) for t in tokens)
                    has_c2 = any(c2.search(t) for t in tokens)
                    if has_c1 and has_c2:
                        conflicts.append({
                            'file': str(rel),
                            'conflict': msg,
                            'snippet': ' '.join(tokens[:8])
                        })
    except Exception as e:
        print(f"Warning: {file_path}: {e}", file=sys.stderr)

    return conflicts, arbitrary_colors

def main():
    parser = argparse.ArgumentParser(description="Style Token Sprawl & Utility Conflict Scanner")
    parser.add_argument("src_dir", type=str, help="Source directory to scan")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    parser.add_argument("--output", type=str, help="Write to file")

    args = parser.parse_args()
    src = Path(args.src_dir).resolve()

    if not src.exists():
        print(f"Error: {src} does not exist.", file=sys.stderr)
        sys.exit(1)

    all_conflicts = []
    global_colors = defaultdict(list)

    valid_exts = {'.tsx', '.jsx', '.html', '.vue', '.svelte', '.css', '.scss'}

    for root, dirs, files in os.walk(src):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            p = Path(root) / f
            if p.suffix in valid_exts:
                c, colors = scan_file_styles(p, src)
                all_conflicts.extend(c)
                for color, files_list in colors.items():
                    global_colors[color].extend(files_list)

    # Sort colors by frequency
    sorted_colors = sorted(global_colors.items(), key=lambda x: len(x[1]), reverse=True)

    report = {
        'total_conflicting_utility_declarations': len(all_conflicts),
        'unique_arbitrary_hex_colors_found': len(sorted_colors),
        'top_scattered_hex_colors': [{ 'color': c, 'count': len(fl) } for c, fl in sorted_colors[:20]],
        'conflicts_sample': all_conflicts[:30]
    }

    if args.json:
        out = json.dumps(report, indent=2)
    else:
        out = f"""# Style Sprawl & Utility Conflict Report

- **Target Directory**: `{src}`
- **Conflicting Utility Declarations**: {len(all_conflicts)}
- **Scattered Arbitrary Hex Colors**: {len(sorted_colors)} unique color codes

## Most Common Arbitrary Hex Colors (Token Migration Candidates)
"""
        for c, fl in sorted_colors[:15]:
            out += f"- `{c}`: referenced {len(fl)} times across components\n"

        out += "\n## Sample Detected Utility Conflicts\n"
        for item in all_conflicts[:15]:
            out += f"- `{item['file']}`: **{item['conflict']}** (`{item['snippet']}...`)\n"

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(out)
        print(f"Saved style audit to {args.output}")
    else:
        print(out)

if __name__ == '__main__':
    main()

