#!/usr/bin/env python3
"""
CSS Class Extractor with Include Resolution
Goes through each HTML file and shows classes found, including those from @@include() directives.
Uses Rich library for beautiful terminal output and saves detailed reports.
"""

import os
import re
import json
from pathlib import Path
from typing import Dict, Set, List, Tuple
from collections import defaultdict
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.tree import Tree
from rich.columns import Columns
from rich.layout import Layout

console = Console()

def extract_classes_from_html_simple(content: str) -> list[str]:
    """Extract CSS classes from HTML content using simple regex."""
    classes = []

    # Match class attributes: class="class1 class2" or class='class1 class2'
    class_pattern = r'class\s*=\s*["\']([^"\']*)["\']'

    for match in re.finditer(class_pattern, content, re.IGNORECASE | re.MULTILINE):
        class_list = match.group(1).strip()
        if class_list:
            # Split on whitespace and filter out empty strings
            for cls in class_list.split():
                cls = cls.strip()
                if cls and cls not in classes:  # Avoid duplicates
                    classes.append(cls)

    return sorted(classes)

def extract_includes_from_html(content: str) -> list[str]:
    """Extract @@include() directives from HTML content."""
    includes = []

    # Match @@include('filename.html') or @@include("filename.html")
    include_pattern = r'@@include\s*\(\s*["\']([^"\']+)["\']\s*\)'

    for match in re.finditer(include_pattern, content, re.IGNORECASE):
        include_file = match.group(1).strip()
        if include_file and include_file not in includes:
            includes.append(include_file)

    return includes

def resolve_includes_detailed(file_path: str, base_dir: str, processed_files: set = None) -> Tuple[list[str], list[str], Dict[str, list[str]]]:
    """
    Recursively resolve all includes for a file with detailed tracking.
    Returns (direct_classes, all_classes_including_includes, class_sources)
    """
    if processed_files is None:
        processed_files = set()

    # Prevent infinite loops
    abs_path = os.path.abspath(file_path)
    if abs_path in processed_files:
        return [], [], {}
    processed_files.add(abs_path)

    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    except Exception as e:
        console.print(f"   [red]❌ Error reading {os.path.basename(file_path)}: {e}[/red]")
        return [], [], {}

    # Get direct classes from this file
    direct_classes = extract_classes_from_html_simple(content)

    # Get includes from this file
    includes = extract_includes_from_html(content)

    # Track class sources
    class_sources = defaultdict(list)
    rel_path = os.path.relpath(file_path, base_dir)

    # Add direct classes to sources
    for cls in direct_classes:
        class_sources[cls].append(rel_path)

    # Recursively process includes
    all_classes = direct_classes.copy()

    for include_file in includes:
        # Resolve relative path
        if not os.path.isabs(include_file):
            include_path = os.path.join(os.path.dirname(file_path), include_file)
        else:
            include_path = include_file

        # Normalize path separators
        include_path = os.path.normpath(include_path)

        if os.path.exists(include_path):
            _, include_classes, include_sources = resolve_includes_detailed(include_path, base_dir, processed_files)

            # Add include classes to our total
            for cls in include_classes:
                if cls not in all_classes:
                    all_classes.append(cls)

            # Merge class sources
            for cls, sources in include_sources.items():
                class_sources[cls].extend(sources)
        else:
            console.print(f"   [yellow]⚠️  Include file not found: {include_file}[/yellow]")

    return direct_classes, sorted(all_classes), dict(class_sources)

def find_html_files(root_path: str) -> list[str]:
    """Find all HTML files in the project."""
    html_files = []

    for root, dirs, files in os.walk(root_path):
        for file in files:
            if file.endswith(('.html', '.htm')):
                html_files.append(os.path.join(root, file))

    return sorted(html_files)

def create_file_tree(html_files: list[str], root_path: str) -> Tree:
    """Create a tree view of HTML file structure."""
    tree = Tree("📁 HTML Files Structure", style="bold blue")

    # Group files by directory
    file_tree = defaultdict(list)

    for file_path in html_files:
        rel_path = os.path.relpath(file_path, root_path)
        dir_path = os.path.dirname(rel_path) or "."
        file_tree[dir_path].append(os.path.basename(rel_path))

    for dir_path in sorted(file_tree.keys()):
        if dir_path == ".":
            branch = tree.add("📄 Root Files")
        else:
            branch = tree.add(f"📁 {dir_path}")

        for file in sorted(file_tree[dir_path]):
            branch.add(f"📄 {file}")

    return tree

def print_rich_summary(results: Dict, html_files: list[str], root_path: str):
    """Print a beautiful summary using Rich."""
    console.print("\n[bold green]🎯 CSS CLASS ANALYSIS SUMMARY[/bold green]")
    console.print("=" * 60)

    # Create summary table
    summary_table = Table(title="📊 Project Overview")
    summary_table.add_column("Metric", style="cyan", no_wrap=True)
    summary_table.add_column("Count", style="magenta", justify="right")

    summary_table.add_row("HTML Files Analyzed", str(len(html_files)))
    summary_table.add_row("Total Direct Classes", str(sum(len(results[file]['direct']) for file in results)))
    summary_table.add_row("Total Classes (with includes)", str(sum(len(results[file]['total']) for file in results)))

    # Calculate unique classes
    all_direct = set()
    all_total = set()
    for file_data in results.values():
        all_direct.update(file_data['direct'])
        all_total.update(file_data['total'])

    summary_table.add_row("Unique Direct Classes", str(len(all_direct)))
    summary_table.add_row("Unique Total Classes", str(len(all_total)))

    console.print(summary_table)

    # File structure tree
    console.print("\n[bold blue]📁 HTML File Structure[/bold blue]")
    tree = create_file_tree(html_files, root_path)
    console.print(tree)

def print_detailed_analysis(results: Dict, root_path: str):
    """Print detailed analysis for each file."""
    console.print("\n[bold yellow]🔍 DETAILED FILE ANALYSIS[/bold yellow]")
    console.print("=" * 60)

    for file_path, file_data in results.items():
        rel_path = os.path.relpath(file_path, root_path)

        # Create file panel
        file_panel = Panel.fit(
            f"[bold cyan]📄 {rel_path}[/bold cyan]\n"
            f"[green]Direct classes: {len(file_data['direct'])}[/green]\n"
            f"[blue]Total classes: {len(file_data['total'])}[/blue]\n"
            f"[yellow]From includes: {len(file_data['total']) - len(file_data['direct'])}[/yellow]",
            title=f"File: {os.path.basename(rel_path)}",
            border_style="blue"
        )

        console.print(file_panel)

        # Show includes if any
        if file_data['includes']:
            includes_text = Text("Includes:", style="bold magenta")
            for include in file_data['includes']:
                includes_text.append(f"\n  • {include}", style="dim")
            console.print(includes_text)

        # Show direct classes (first 10)
        if file_data['direct']:
            console.print("\n[bold green]Direct Classes:[/bold green]")
            classes_text = Text()
            for i, cls in enumerate(file_data['direct'][:10], 1):
                classes_text.append(f"  {cls}\n")
            if len(file_data['direct']) > 10:
                classes_text.append(f"\n... and {len(file_data['direct']) - 10} more", style="dim")
            console.print(classes_text)

        console.print("-" * 60)

def save_detailed_report(results: Dict, class_sources: Dict[str, list[str]], root_path: str, output_file: str = "css_analysis_report.json"):
    """Save comprehensive report with class sources."""
    report = {
        "summary": {
            "total_files": len(results),
            "total_direct_classes": sum(len(data['direct']) for data in results.values()),
            "total_classes_with_includes": sum(len(data['total']) for data in results.values()),
            "unique_direct_classes": len(set(cls for data in results.values() for cls in data['direct'])),
            "unique_total_classes": len(set(cls for data in results.values() for cls in data['total']))
        },
        "files": {},
        "class_sources": {},
        "includes_tree": {}
    }

    # File details
    for file_path, file_data in results.items():
        rel_path = os.path.relpath(file_path, root_path)
        report["files"][rel_path] = {
            "direct_classes": file_data['direct'],
            "total_classes": file_data['total'],
            "includes": file_data['includes'],
            "additional_from_includes": len(file_data['total']) - len(file_data['direct'])
        }

    # Class sources
    report["class_sources"] = class_sources

    # Save JSON report
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    console.print(f"\n[green]✅ Detailed report saved to: {output_file}[/green]")

def save_readable_report(results: Dict, class_sources: Dict[str, list[str]], root_path: str, output_file: str = "css_analysis_readable.txt"):
    """Save a human-readable report."""
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("CSS CLASS ANALYSIS REPORT\n")
        f.write("=" * 60 + "\n\n")

        f.write("SUMMARY:\n")
        f.write(f"- Total HTML files: {len(results)}\n")
        f.write(f"- Total direct classes: {sum(len(data['direct']) for data in results.values())}\n")
        f.write(f"- Total classes with includes: {sum(len(data['total']) for data in results.values())}\n\n")

        f.write("DETAILED FILE ANALYSIS:\n")
        f.write("-" * 60 + "\n\n")

        for file_path, file_data in results.items():
            rel_path = os.path.relpath(file_path, root_path)
            f.write(f"📄 {rel_path}\n")
            f.write(f"  Direct classes: {len(file_data['direct'])}\n")
            f.write(f"  Total classes: {len(file_data['total'])}\n")
            f.write(f"  From includes: {len(file_data['total']) - len(file_data['direct'])}\n")

            if file_data['includes']:
                f.write("  Includes:\n")
                for include in file_data['includes']:
                    f.write(f"    • {include}\n")

            if file_data['direct']:
                f.write("  Direct classes:\n")
                for i, cls in enumerate(file_data['direct'], 1):
                    f.write(f"    {cls}\n")
                if len(file_data['direct']) > 10:
                    f.write(f"    ... and {len(file_data['direct']) - 10} more\n")

            f.write("\n")

        f.write("\nCLASS SOURCES (which files define each class):\n")
        f.write("-" * 60 + "\n\n")

        for cls in sorted(class_sources.keys()):
            sources = class_sources[cls]
            f.write(f"{cls}:\n")
            for source in sources:
                f.write(f"  • {source}\n")
            f.write("\n")

    console.print(f"[green]📄 Readable report saved to: {output_file}[/green]")

def main():
    """Main function with Rich formatting."""
    project_root = os.getcwd()

    # Header
    console.print("\n[bold magenta]🎨 CSS CLASS EXTRACTOR WITH RICH FORMATTING[/bold magenta]")
    console.print("[bold cyan]Analyzes HTML files and resolves @@include() directives[/bold cyan]")
    console.print("=" * 80)

    # Find HTML files
    html_files = find_html_files(project_root)

    if not html_files:
        console.print("[red]❌ No HTML files found in the project![/red]")
        return

    console.print(f"\n[blue]📂 Found {len(html_files)} HTML files to analyze[/blue]\n")

    # Analyze each file
    results = {}
    all_class_sources = defaultdict(list)

    with console.status("[bold green]Analyzing files...[/bold green]") as status:
        for i, html_file in enumerate(html_files, 1):
            status.update(f"[bold green]Analyzing file {i}/{len(html_files)}: {os.path.basename(html_file)}[/bold green]")

            direct_classes, total_classes, class_sources = resolve_includes_detailed(html_file, project_root)

            # Get includes for this file
            try:
                with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                includes = extract_includes_from_html(content)
            except:
                includes = []

            results[html_file] = {
                'direct': direct_classes,
                'total': total_classes,
                'includes': includes
            }

            # Merge class sources
            for cls, sources in class_sources.items():
                all_class_sources[cls].extend(sources)

    # Remove duplicates from sources
    for cls in all_class_sources:
        all_class_sources[cls] = list(set(all_class_sources[cls]))

    # Print rich summary
    print_rich_summary(results, html_files, project_root)

    # Print detailed analysis
    print_detailed_analysis(results, project_root)

    # Save reports
    save_detailed_report(results, dict(all_class_sources), project_root, "css_analysis_report.json")
    save_readable_report(results, dict(all_class_sources), project_root, "css_analysis_readable.txt")

    console.print("\n[bold green]🎉 Analysis complete![/bold green]")
    console.print("[dim]Reports saved with detailed class source tracking[/dim]")

if __name__ == "__main__":
    main()