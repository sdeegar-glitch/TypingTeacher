#!/usr/bin/env python3
"""
website-audit.py — Codebase Discovery and Frontend Fingerprinting Tool.
Part of the ai-slop-remover skill suite.

Usage:
    python website-audit.py <project-dir> [--json] [--output <report.md>]
"""

import os
import sys
import json
import argparse
from pathlib import Path

IGNORE_DIRS = {
    'node_modules', '.git', '.next', 'dist', 'build', 'out',
    '.turbo', 'coverage', '.cache', '__pycache__', 'target', '.venv', 'venv'
}

def detect_framework(project_path: Path) -> dict:
    pkg_json = project_path / 'package.json'
    frontend_info = {
        'framework': 'Plain HTML/CSS/JS',
        'build_tool': 'None detected',
        'styling': [],
        'typescript': False,
        'testing': [],
        'dependencies': {}
    }

    if (project_path / 'frontend' / 'package.json').exists():
        pkg_json = project_path / 'frontend' / 'package.json'

    if pkg_json.exists():
        try:
            with open(pkg_json, 'r', encoding='utf-8') as f:
                data = json.load(f)
                deps = {**data.get('dependencies', {}), **data.get('devDependencies', {})}
                frontend_info['dependencies'] = list(deps.keys())

                # Frameworks
                if 'next' in deps:
                    frontend_info['framework'] = f"Next.js ({deps.get('next')})"
                elif 'react' in deps:
                    frontend_info['framework'] = f"React ({deps.get('react')})"
                elif 'nuxt' in deps or 'vue' in deps:
                    frontend_info['framework'] = f"Vue/Nuxt ({deps.get('vue', deps.get('nuxt'))})"
                elif 'svelte' in deps or '@sveltejs/kit' in deps:
                    frontend_info['framework'] = "Svelte / SvelteKit"
                elif '@angular/core' in deps:
                    frontend_info['framework'] = "Angular"

                # Build tools
                if 'vite' in deps:
                    frontend_info['build_tool'] = f"Vite ({deps.get('vite')})"
                elif 'webpack' in deps:
                    frontend_info['build_tool'] = "Webpack"

                # Styling
                if 'tailwindcss' in deps or '@tailwindcss/vite' in deps:
                    frontend_info['styling'].append('Tailwind CSS')
                if 'bootstrap' in deps:
                    frontend_info['styling'].append('Bootstrap')
                if 'styled-components' in deps:
                    frontend_info['styling'].append('Styled Components')
                if '@emotion/react' in deps:
                    frontend_info['styling'].append('Emotion')

                # TypeScript
                if 'typescript' in deps or any(project_path.rglob('tsconfig*.json')):
                    frontend_info['typescript'] = True

                # Testing
                if 'vitest' in deps:
                    frontend_info['testing'].append('Vitest')
                if 'jest' in deps:
                    frontend_info['testing'].append('Jest')
                if '@playwright/test' in deps:
                    frontend_info['testing'].append('Playwright')
        except Exception as e:
            frontend_info['error'] = f"Failed to parse package.json: {e}"

    return frontend_info

def scan_routes_and_pages(project_path: Path) -> list:
    routes = []
    # Search common router directories
    search_dirs = [
        project_path / 'src' / 'pages',
        project_path / 'frontend' / 'src' / 'pages',
        project_path / 'src' / 'app',
        project_path / 'pages',
        project_path / 'app'
    ]

    for s_dir in search_dirs:
        if s_dir.exists():
            for root, dirs, files in os.walk(s_dir):
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
                for f in files:
                    if f.endswith(('.tsx', '.jsx', '.js', '.vue', '.svelte', '.html')):
                        rel = os.path.relpath(os.path.join(root, f), project_path)
                        routes.append(rel)
    return sorted(routes)

def scan_styles_and_fonts(project_path: Path) -> dict:
    style_files = []
    font_declarations = []
    color_vars = []

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        for f in files:
            if f.endswith(('.css', '.scss', '.sass', '.less')):
                full_path = Path(root) / f
                rel = full_path.relative_to(project_path)
                style_files.append(str(rel))

                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as sf:
                        content = sf.read()
                        if '@font-face' in content or 'fonts.googleapis.com' in content:
                            font_declarations.append(str(rel))
                        if '--color-' in content or '--brand-' in content:
                            color_vars.append(str(rel))
                except Exception:
                    pass

    return {
        'stylesheets': style_files,
        'fonts_detected_in': font_declarations,
        'css_variable_files': color_vars
    }

def main():
    parser = argparse.ArgumentParser(description="Website Codebase & Design Architecture Audit")
    parser.add_argument("project_path", type=str, help="Root directory of target website project")
    parser.add_argument("--json", action="store_true", help="Output raw JSON instead of Markdown")
    parser.add_argument("--output", type=str, help="Path to write output report file")

    args = parser.parse_args()
    proj = Path(args.project_path).resolve()

    if not proj.exists() or not proj.is_dir():
        print(f"Error: Target path '{proj}' is not a valid directory.", file=sys.stderr)
        sys.exit(1)

    framework_info = detect_framework(proj)
    pages = scan_routes_and_pages(proj)
    styles = scan_styles_and_fonts(proj)

    report_data = {
        'target_directory': str(proj),
        'technology_stack': framework_info,
        'detected_pages_count': len(pages),
        'pages_sample': pages[:25],
        'styles_and_fonts': styles
    }

    if args.json:
        out_text = json.dumps(report_data, indent=2)
    else:
        out_text = f"""# Codebase Discovery & Architecture Report

- **Target Path**: `{proj}`
- **Primary Framework**: **{framework_info['framework']}**
- **Build Tool**: {framework_info['build_tool']}
- **Styling Architecture**: {', '.join(framework_info['styling']) or 'Custom / Vanilla'}
- **TypeScript**: {'Yes' if framework_info['typescript'] else 'No'}
- **Testing Suites**: {', '.join(framework_info['testing']) or 'None detected'}

## Discovered Routes & Page Components ({len(pages)} detected)
"""
        for p in pages[:20]:
            out_text += f"- `{p}`\n"
        if len(pages) > 20:
            out_text += f"- *...and {len(pages) - 20} more page files.*\n"

        out_text += f"""
## Styling & Typography Surface
- **Style Files Found**: {len(styles['stylesheets'])} stylesheets
- **CSS Token/Variable Files**: {len(styles['css_variable_files'])}
- **Font Declarations Detected In**: {len(styles['fonts_detected_in'])} files
"""

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as out_f:
            out_f.write(out_text)
        print(f"Audit report successfully written to {args.output}")
    else:
        print(out_text)

if __name__ == '__main__':
    main()

