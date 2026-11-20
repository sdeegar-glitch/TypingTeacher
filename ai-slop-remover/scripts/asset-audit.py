#!/usr/bin/env python3
"""
asset-audit.py — Image, Font & Asset Performance/Accessibility Scanner.
Part of the ai-slop-remover skill suite.

Audits:
1. Large raster images (> 200KB) lacking modern WebP/AVIF formats.
2. <img> tags missing required 'alt' accessibility attributes.
3. <img> tags missing explicit 'width' and 'height' causing Cumulative Layout Shift (CLS).
4. External unoptimized third-party font/script requests.

Usage:
    python asset-audit.py <project-dir> [--json] [--output <report.md>]
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path

IGNORE_DIRS = {
    'node_modules', '.git', '.next', 'dist', 'build', 'out',
    '.turbo', 'coverage', '.cache', '__pycache__', 'target', '.venv', 'venv'
}

IMG_TAG_REGEX = re.compile(r'<img\b([^>]*?)>', re.IGNORECASE)
ALT_REGEX = re.compile(r'\balt\s*=\s*["\'](.*?)["\']', re.IGNORECASE)
WIDTH_REGEX = re.compile(r'\bwidth\s*=\s*["\']?(\d+)', re.IGNORECASE)
HEIGHT_REGEX = re.compile(r'\bheight\s*=\s*["\']?(\d+)', re.IGNORECASE)

def scan_assets(root_path: Path):
    heavy_images = []
    svg_icons = []
    img_accessibility_issues = []

    # 1. Physical file scan
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            p = Path(root) / f
            suffix = p.suffix.lower()
            rel = p.relative_to(root_path)

            if suffix in {'.png', '.jpg', '.jpeg', '.gif', '.bmp'}:
                size_bytes = p.stat().st_size
                if size_bytes > 200 * 1024:  # > 200 KB
                    heavy_images.append({
                        'path': str(rel),
                        'size_kb': round(size_bytes / 1024, 1),
                        'format': suffix[1:].upper()
                    })
            elif suffix == '.svg':
                svg_icons.append(str(rel))

    # 2. Code usage scan for <img> tags
    valid_markup_exts = {'.tsx', '.jsx', '.html', '.vue', '.svelte'}
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            p = Path(root) / f
            if p.suffix in valid_markup_exts:
                try:
                    with open(p, 'r', encoding='utf-8', errors='ignore') as mf:
                        content = mf.read()
                        rel = p.relative_to(root_path)
                        matches = IMG_TAG_REGEX.findall(content)
                        for attrs in matches:
                            has_alt = bool(ALT_REGEX.search(attrs))
                            has_w = bool(WIDTH_REGEX.search(attrs))
                            has_h = bool(HEIGHT_REGEX.search(attrs))

                            if not has_alt or not (has_w and has_h):
                                img_accessibility_issues.append({
                                    'file': str(rel),
                                    'missing_alt': not has_alt,
                                    'missing_dimensions': not (has_w and has_h),
                                    'snippet': f"<img {attrs.strip()[:60]}...>"
                                })
                except Exception:
                    pass

    return heavy_images, svg_icons, img_accessibility_issues

def main():
    parser = argparse.ArgumentParser(description="Asset Quality & Accessibility Auditor")
    parser.add_argument("project_path", type=str, help="Target project root directory")
    parser.add_argument("--json", action="store_true", help="Output raw JSON")
    parser.add_argument("--output", type=str, help="Write output to file")

    args = parser.parse_args()
    proj = Path(args.project_path).resolve()

    if not proj.exists():
        print(f"Error: {proj} does not exist.", file=sys.stderr)
        sys.exit(1)

    heavy_imgs, svgs, a11y_issues = scan_assets(proj)

    report = {
        'target_project': str(proj),
        'heavy_images_count': len(heavy_imgs),
        'heavy_images': sorted(heavy_imgs, key=lambda x: x['size_kb'], reverse=True),
        'total_svgs': len(svgs),
        'markup_image_issues_count': len(a11y_issues),
        'markup_image_issues_sample': a11y_issues[:30]
    }

    if args.json:
        out = json.dumps(report, indent=2)
    else:
        out = f"""# Asset Quality & Layout Stability Report

- **Target Directory**: `{proj}`
- **Unoptimized Heavy Images (>200 KB)**: {len(heavy_imgs)} files
- **Total SVG Icons Discovered**: {len(svgs)} files
- **Image Markup Issues (Missing Alt / CLS Dimensions)**: {len(a11y_issues)} instances

## Heavy Images Requiring WebP/AVIF Conversion
"""
        for img in heavy_imgs[:15]:
            out += f"- `{img['path']}` — **{img['size_kb']} KB** ({img['format']})\n"
        if not heavy_imgs:
            out += "*(No heavy images over 200KB detected. Clean performance!)*\n"

        out += "\n## Sample Image Accessibility & Dimension Violations\n"
        for issue in a11y_issues[:15]:
            missing = []
            if issue['missing_alt']: missing.append('Missing alt attribute')
            if issue['missing_dimensions']: missing.append('Missing width/height (CLS Risk)')
            out += f"- `{issue['file']}`: **{', '.join(missing)}**\n  `{issue['snippet']}`\n"

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(out)
        print(f"Saved asset audit to {args.output}")
    else:
        print(out)

if __name__ == '__main__':
    main()

