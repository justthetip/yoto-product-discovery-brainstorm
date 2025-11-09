#!/usr/bin/env python3
"""
Display Yoto content in various formats
"""
import json
import sys
from typing import List, Dict, Any

def load_content(filename='data/yoto-content.json') -> List[Dict[str, Any]]:
    """Load content from JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('data', {}).get('products', [])

def display_table(products: List[Dict], max_items: int = 20):
    """Display products in a table format"""
    print("\n" + "="*120)
    print(f"{'Title':<40} {'Author':<20} {'Price':>8} {'Age':>8} {'Runtime':>10} {'Type':<25}")
    print("="*120)

    for i, p in enumerate(products[:max_items]):
        title = p.get('title', 'Unknown')[:38]
        author = p.get('author', 'Unknown')[:18]
        price = f"£{p.get('price', 'N/A')}"
        age_range = p.get('ageRange', [])
        age_str = f"{age_range[0]}-{age_range[1]}" if len(age_range) >= 2 else "N/A"

        runtime_sec = p.get('runtime', 0)
        if runtime_sec:
            hours = runtime_sec // 3600
            mins = (runtime_sec % 3600) // 60
            runtime_str = f"{hours}h {mins}m" if hours else f"{mins}m"
        else:
            runtime_str = "N/A"

        content_types = p.get('contentType', [])
        type_str = content_types[0][:23] if content_types else "N/A"

        print(f"{title:<40} {author:<20} {price:>8} {age_str:>8} {runtime_str:>10} {type_str:<25}")

    if len(products) > max_items:
        print(f"\n... and {len(products) - max_items} more products")
    print("="*120 + "\n")

def display_cards(products: List[Dict], max_items: int = 10):
    """Display products in a card format"""
    for i, p in enumerate(products[:max_items]):
        print("\n┌" + "─"*78 + "┐")
        print(f"│ {p.get('title', 'Unknown'):<76} │")
        print("├" + "─"*78 + "┤")

        author = f"Author: {p.get('author', 'Unknown')}"
        print(f"│ {author:<76} │")

        price = f"Price: £{p.get('price', 'N/A')}"
        age_range = p.get('ageRange', [])
        age_str = f"Age: {age_range[0]}-{age_range[1]} years" if len(age_range) >= 2 else "Age: N/A"
        info_line = f"{price:<30} {age_str}"
        print(f"│ {info_line:<76} │")

        runtime_sec = p.get('runtime', 0)
        if runtime_sec:
            hours = runtime_sec // 3600
            mins = (runtime_sec % 3600) // 60
            if hours:
                runtime_str = f"Runtime: {hours}h {mins}m"
            else:
                runtime_str = f"Runtime: {mins}m"
            print(f"│ {runtime_str:<76} │")

        content_types = ', '.join(p.get('contentType', []))
        if content_types:
            type_str = f"Type: {content_types}"[:76]
            print(f"│ {type_str:<76} │")

        blurb = p.get('blurb', '')
        if blurb:
            blurb_short = blurb[:150] + "..." if len(blurb) > 150 else blurb
            # Split into lines
            words = blurb_short.split()
            line = ""
            for word in words:
                if len(line) + len(word) + 1 <= 74:
                    line += word + " "
                else:
                    print(f"│ {line.strip():<76} │")
                    line = word + " "
            if line:
                print(f"│ {line.strip():<76} │")

        available = "✓ Available" if p.get('availableForSale') else "✗ Not Available"
        print(f"│ {available:<76} │")

        print("└" + "─"*78 + "┘")

    if len(products) > max_items:
        print(f"\n... and {len(products) - max_items} more products\n")

def display_json(products: List[Dict], max_items: int = 5):
    """Display products as formatted JSON"""
    output = products[:max_items]
    print(json.dumps(output, indent=2, ensure_ascii=False))
    if len(products) > max_items:
        print(f"\n... and {len(products) - max_items} more products")

def display_grouped_by_type(products: List[Dict]):
    """Display products grouped by content type"""
    groups = {}
    for p in products:
        for ct in p.get('contentType', ['Uncategorized']):
            if ct not in groups:
                groups[ct] = []
            groups[ct].append(p)

    for content_type, items in sorted(groups.items()):
        print(f"\n{'='*80}")
        print(f"{content_type} ({len(items)} items)")
        print('='*80)

        for i, p in enumerate(items[:5]):
            title = p.get('title', 'Unknown')
            author = p.get('author', 'Unknown')
            price = p.get('price', 'N/A')
            print(f"  • {title} - {author} (£{price})")

        if len(items) > 5:
            print(f"  ... and {len(items) - 5} more")

def display_by_age_groups(products: List[Dict]):
    """Display products grouped by age range"""
    age_groups = {
        '0-3': [],
        '3-6': [],
        '6-9': [],
        '9-12': [],
        '12+': []
    }

    for p in products:
        age_range = p.get('ageRange', [])
        if len(age_range) >= 2:
            min_age = age_range[0]
            if min_age < 3:
                age_groups['0-3'].append(p)
            elif min_age < 6:
                age_groups['3-6'].append(p)
            elif min_age < 9:
                age_groups['6-9'].append(p)
            elif min_age < 12:
                age_groups['9-12'].append(p)
            else:
                age_groups['12+'].append(p)

    for age_range, items in age_groups.items():
        if items:
            print(f"\n{'='*80}")
            print(f"Age {age_range} ({len(items)} items)")
            print('='*80)

            for p in items[:5]:
                title = p.get('title', 'Unknown')
                author = p.get('author', 'Unknown')
                print(f"  • {title} - {author}")

            if len(items) > 5:
                print(f"  ... and {len(items) - 5} more")

def main():
    """Main display function"""
    products = load_content()

    # Get display mode from command line
    mode = sys.argv[1] if len(sys.argv) > 1 else 'cards'

    print(f"\nDisplaying {len(products)} products in '{mode}' mode\n")

    if mode == 'table':
        display_table(products, max_items=30)
    elif mode == 'json':
        display_json(products, max_items=5)
    elif mode == 'grouped':
        display_grouped_by_type(products)
    elif mode == 'age':
        display_by_age_groups(products)
    else:
        display_cards(products, max_items=10)

    print("\nAvailable display modes:")
    print("  python3 src/display.py table   - Table view (compact)")
    print("  python3 src/display.py cards   - Card view (detailed)")
    print("  python3 src/display.py json    - JSON format")
    print("  python3 src/display.py grouped - Grouped by content type")
    print("  python3 src/display.py age     - Grouped by age range")

if __name__ == '__main__':
    main()
