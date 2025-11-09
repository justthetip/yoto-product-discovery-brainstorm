#!/usr/bin/env python3
"""
Generate statistics and insights about the Yoto content library
"""
import json
from collections import Counter
from typing import List, Dict, Any

def load_content(filename='data/yoto-content.json') -> List[Dict[str, Any]]:
    """Load content from JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('data', {}).get('products', [])

def print_header(text: str):
    """Print a formatted header"""
    print(f"\n{'='*80}")
    print(f" {text}")
    print('='*80)

def basic_stats(products: List[Dict]):
    """Print basic statistics"""
    print_header("BASIC STATISTICS")

    total = len(products)
    available = len([p for p in products if p.get('availableForSale')])
    new_items = len([p for p in products if p.get('flag') == 'New to Yoto'])

    print(f"Total products: {total}")
    print(f"Available for sale: {available} ({available/total*100:.1f}%)")
    print(f"New to Yoto: {new_items}")

def price_stats(products: List[Dict]):
    """Print price statistics"""
    print_header("PRICE ANALYSIS")

    prices = []
    for p in products:
        try:
            price = float(p.get('price', 0))
            if price > 0:
                prices.append(price)
        except (ValueError, TypeError):
            continue

    if prices:
        print(f"Average price: £{sum(prices)/len(prices):.2f}")
        print(f"Median price: £{sorted(prices)[len(prices)//2]:.2f}")
        print(f"Price range: £{min(prices):.2f} - £{max(prices):.2f}")

        # Price distribution
        under_10 = len([p for p in prices if p < 10])
        range_10_20 = len([p for p in prices if 10 <= p < 20])
        range_20_30 = len([p for p in prices if 20 <= p < 30])
        over_30 = len([p for p in prices if p >= 30])

        print("\nPrice distribution:")
        print(f"  Under £10: {under_10} ({under_10/len(prices)*100:.1f}%)")
        print(f"  £10-£20: {range_10_20} ({range_10_20/len(prices)*100:.1f}%)")
        print(f"  £20-£30: {range_20_30} ({range_20_30/len(prices)*100:.1f}%)")
        print(f"  Over £30: {over_30} ({over_30/len(prices)*100:.1f}%)")

def content_type_stats(products: List[Dict]):
    """Print content type statistics"""
    print_header("CONTENT TYPES")

    all_types = []
    for p in products:
        all_types.extend(p.get('contentType', []))

    type_counts = Counter(all_types)

    print(f"Total content types: {len(type_counts)}\n")
    print("Top 15 categories:")
    for i, (ct, count) in enumerate(type_counts.most_common(15), 1):
        pct = count / len(products) * 100
        print(f"  {i:2}. {ct:<35} {count:4} ({pct:5.1f}%)")

def author_stats(products: List[Dict]):
    """Print author statistics"""
    print_header("AUTHOR ANALYSIS")

    authors = [p.get('author', '') for p in products if p.get('author')]
    author_counts = Counter(authors)

    print(f"Total unique authors: {len(author_counts)}\n")
    print("Top 15 authors by number of products:")
    for i, (author, count) in enumerate(author_counts.most_common(15), 1):
        print(f"  {i:2}. {author:<40} {count:3} products")

def runtime_stats(products: List[Dict]):
    """Print runtime statistics"""
    print_header("RUNTIME ANALYSIS")

    runtimes = [p.get('runtime', 0) for p in products if p.get('runtime')]

    if runtimes:
        avg_seconds = sum(runtimes) / len(runtimes)
        avg_minutes = avg_seconds / 60
        total_hours = sum(runtimes) / 3600

        print(f"Products with runtime info: {len(runtimes)}")
        print(f"Average runtime: {avg_minutes:.0f} minutes")
        print(f"Total content hours: {total_hours:,.0f} hours\n")

        # Runtime distribution
        under_30 = len([r for r in runtimes if r < 1800])  # 30 min
        range_30_60 = len([r for r in runtimes if 1800 <= r < 3600])  # 30-60 min
        range_1_2h = len([r for r in runtimes if 3600 <= r < 7200])  # 1-2 hours
        over_2h = len([r for r in runtimes if r >= 7200])  # 2+ hours

        print("Runtime distribution:")
        print(f"  Under 30 min: {under_30} ({under_30/len(runtimes)*100:.1f}%)")
        print(f"  30-60 min: {range_30_60} ({range_30_60/len(runtimes)*100:.1f}%)")
        print(f"  1-2 hours: {range_1_2h} ({range_1_2h/len(runtimes)*100:.1f}%)")
        print(f"  Over 2 hours: {over_2h} ({over_2h/len(runtimes)*100:.1f}%)")

def age_stats(products: List[Dict]):
    """Print age range statistics"""
    print_header("AGE RANGE ANALYSIS")

    age_data = []
    for p in products:
        age_range = p.get('ageRange', [])
        if age_range and len(age_range) >= 2:
            if age_range[0] is not None and age_range[1] is not None:
                age_data.append((age_range[0], age_range[1]))

    if age_data:
        print(f"Products with age info: {len(age_data)}\n")

        # Age group distribution
        age_groups = {
            'Babies (0-2)': len([a for a in age_data if a[0] <= 2]),
            'Toddlers (2-4)': len([a for a in age_data if a[0] <= 4 and a[1] >= 2]),
            'Preschool (3-5)': len([a for a in age_data if a[0] <= 5 and a[1] >= 3]),
            'Early Elementary (5-8)': len([a for a in age_data if a[0] <= 8 and a[1] >= 5]),
            'Middle Elementary (8-11)': len([a for a in age_data if a[0] <= 11 and a[1] >= 8]),
            'Pre-teen+ (11+)': len([a for a in age_data if a[1] >= 11]),
        }

        print("Content by age group:")
        for group, count in age_groups.items():
            pct = count / len(age_data) * 100
            print(f"  {group:<30} {count:4} ({pct:5.1f}%)")

def language_stats(products: List[Dict]):
    """Print language statistics"""
    print_header("LANGUAGE DISTRIBUTION")

    all_languages = []
    for p in products:
        all_languages.extend(p.get('languages', []))

    lang_counts = Counter(all_languages)

    for lang, count in lang_counts.most_common():
        pct = count / len(products) * 100
        print(f"  {lang:<20} {count:4} ({pct:5.1f}%)")

def main():
    """Generate all statistics"""
    products = load_content()

    print("\n" + "="*80)
    print(" YOTO CONTENT LIBRARY STATISTICS")
    print("="*80)

    basic_stats(products)
    price_stats(products)
    content_type_stats(products)
    author_stats(products)
    runtime_stats(products)
    age_stats(products)
    language_stats(products)

    print("\n" + "="*80 + "\n")

if __name__ == '__main__':
    main()
