import os
import re
from collections import defaultdict

def find_markdown_files(root_dir):
    """Finds all markdown files in a directory."""
    md_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(".md"):
                md_files.append(os.path.join(dirpath, filename))
    return md_files

def parse_dependencies(file_path):
    """Parses the dependencies section of a markdown file."""
    dependencies = []
    in_dependencies_section = False
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip().lower() == "## dependencies":
                in_dependencies_section = True
                continue
            if in_dependencies_section:
                if line.strip().startswith("## ") or line.strip().startswith("---"):
                    # Reached the end of the dependencies section
                    break
                # Look for markdown links like `- `...` -`
                match = re.search(r"- `([^`]+)`", line)
                if match:
                    # Extract the filename, ignore the relative path for now
                    dep_path = match.group(1)
                    dep_filename = os.path.basename(dep_path)
                    dependencies.append(dep_filename)
    return dependencies

def generate_traceability_matrix(root_dir, output_file):
    """Generates the traceability matrix report."""
    md_files = find_markdown_files(root_dir)

    dependencies_map = defaultdict(list)
    dependents_map = defaultdict(list)

    for file_path in md_files:
        file_key = os.path.basename(file_path)
        dependencies = parse_dependencies(file_path)
        dependencies_map[file_key] = sorted(dependencies)

        for dep in dependencies:
            dependents_map[dep].append(file_key)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Repository Traceability Matrix\n\n")
        f.write("This report provides a 360-degree view of the documentation graph, mapping each document to its dependencies (files it links to) and dependents (files that link to it).\n\n")

        f.write("| Document | Dependencies (Links To) | Dependents (Linked From) |\n")
        f.write("| :--- | :--- | :--- |\n")

        all_docs = sorted(set(dependencies_map.keys()) | set(dependents_map.keys()))

        for doc in all_docs:
            deps_list = ", ".join([f"`{d}`" for d in dependencies_map.get(doc, [])])
            if not deps_list:
                deps_list = "_None_"

            dependents_list = ", ".join([f"`{d}`" for d in sorted(dependents_map.get(doc, []))])
            if not dependents_list:
                dependents_list = "_None_"

            f.write(f"| `{doc}` | {deps_list} | {dependents_list} |\n")

    print(f"Traceability matrix generated at {output_file}")

if __name__ == "__main__":
    docs_root = "docs"
    # Ensure the output directory exists
    output_dir = "reports/rtm"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "repository_traceability_matrix.md")
    generate_traceability_matrix(docs_root, output_path)
