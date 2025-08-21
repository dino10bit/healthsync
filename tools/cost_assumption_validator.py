import os
import argparse
import re

def extract_assumptions(file_path):
    """
    This is a placeholder function to extract cost assumptions.
    A real implementation would parse the markdown more intelligently.
    """
    assumptions = {}
    with open(file_path, 'r') as f:
        content = f.read()

        # Example: Find a value like "Pro Tier Pricing: **$2.99 per month**"
        match = re.search(r"Pro Tier Pricing.*?\*\*([$0-9.]+)", content)
        if match:
            assumptions['pro_tier_price'] = float(match.group(1).replace('$', ''))

    return assumptions

def validate_assumptions(assumptions, actuals):
    """
    This placeholder function would compare extracted assumptions
    against actual, real-world data or other configuration files.
    """
    print("INFO: Validating cost assumptions...")

    issues = []

    # Example validation
    expected_price = assumptions.get('pro_tier_price')
    actual_price = actuals.get('pro_tier_price')

    if expected_price is not None and actual_price is not None:
        if abs(expected_price - actual_price) > 0.01:
            issue = (
                f"Price mismatch! "
                f"Assumption doc says ${expected_price}, "
                f"but config says ${actual_price}."
            )
            issues.append(issue)

    if not issues:
        print("SUCCESS: All cost assumptions appear to be valid.")

    return issues

def main():
    """Main function to run the cost assumption validator."""
    parser = argparse.ArgumentParser(description="Validate cost assumptions against other sources.")
    parser.add_argument(
        "--assumptions-file",
        default="docs/costs/66-costs-model.md",
        help="The markdown file containing cost assumptions."
    )
    # In a real scenario, this might point to a terraform.tfvars, a .json config,
    # or another source of truth for real values.
    parser.add_argument(
        "--actuals-config",
        default="placeholder_actuals.json",
        help="A file representing the 'actual' configured values."
    )
    args = parser.parse_args()

    if not os.path.exists(args.assumptions_file):
        print(f"ERROR: Assumptions file not found: {args.assumptions_file}")
        return

    # Create a dummy actuals file for demonstration
    # A real script would fetch this from a real source.
    dummy_actuals = {
        "pro_tier_price": 2.99
    }

    assumptions = extract_assumptions(args.assumptions_file)

    print(f"Extracted Assumptions: {assumptions}")
    print(f"Mock 'Actual' Values: {dummy_actuals}")

    issues = validate_assumptions(assumptions, dummy_actuals)

    if issues:
        print("\nCost assumption validation failed:")
        for issue in issues:
            print(f"- {issue}")
    else:
        print("\nCost assumption validation passed.")


if __name__ == "__main__":
    main()
