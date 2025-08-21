import os
import re

def find_markdown_files(root_dir):
    """Finds all markdown files in a directory."""
    md_files = []
    for dirpath, _, filenames in os.walk(root_dir):
        for filename in filenames:
            if filename.endswith(".md"):
                md_files.append(os.path.join(dirpath, filename))
    return md_files

def extract_risk_tables(file_path):
    """Extracts the content of markdown tables under a 'Risk' section."""
    risk_rows = []
    in_risk_section = False
    in_table = False
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            # Check for headers like "Risk Analysis", "Risk Register", etc.
            if re.search(r"^##+ .*risk", line.strip(), re.IGNORECASE):
                in_risk_section = True
                continue

            if in_risk_section:
                # Stop if we hit the next major section
                if line.strip().startswith("## ") or line.strip().startswith("# "):
                    in_risk_section = False
                    in_table = False
                    continue

                # Identify table rows
                if line.strip().startswith("|"):
                    # Ignore header and separator lines
                    if "---" not in line:
                        # Add the filename as the first column
                        risk_rows.append(f"| `{os.path.basename(file_path)}` {line.strip()}")
    return risk_rows

def generate_risk_register(root_dir, output_file):
    """Generates the consolidated risk register report."""
    md_files = find_markdown_files(root_dir)

    all_risk_rows = []
    for file_path in md_files:
        rows = extract_risk_tables(file_path)
        if rows:
            # We only want the content rows, not the header from each file
            all_risk_rows.extend(rows)

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write("# Consolidated Risk Register\n\n")
        f.write("This report consolidates all risk analysis tables from documents across the repository into a single view.\n\n")

        if not all_risk_rows:
            f.write("No risk tables found.\n")
            return

        # Create a generic header. Note: This assumes a relatively consistent table structure.
        # A more robust solution might try to parse headers, but this is good for now.
        f.write("| Source Document | Risk ID | Risk Description | Probability | Impact | Mitigation Strategy |\n")
        f.write("| :--- | :--- | :--- | :--- | :--- | :--- |\n")

        for row in all_risk_rows:
            # The row already starts with a pipe, so we just need to clean it up a bit
            # This is a simplification; a real script would parse columns properly.
            # We remove the first pipe from the original row to avoid `||`
            f.write(f"{row[1:]}\n")

    print(f"Risk register generated at {output_file}")

if __name__ == "__main__":
    docs_root = "docs"
    output_dir = "reports"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "risk_register.md")
    generate_risk_register(docs_root, output_path)
