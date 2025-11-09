#!/usr/bin/env python3
"""
Advanced filtering with multiple criteria
"""
import json
import argparse
from typing import List, Dict, Any

def load_content(filename='data/yoto-content.json') -> List[Dict[str, Any]]:
    """Load content from JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('data', {}).get('products', [])

def apply_filters(products: List[Dict], args) -> List[Dict]:
    """Apply all filters based on arguments"""
    results = products

    # Text search
    if args.search:
        query = args.search.lower()
        results = [p for p in results if query in p.get('title', '').lower()]

    # Author filter
    if args.author:
        author_query = args.author.lower()
        results = [p for p in results if author_query in p.get('author', '').lower()]

    # Content type filter
    if args.content_type:
        ct_query = args.content_type.lower()
        results = [p for p in results
                  if any(ct_query in ct.lower() for ct in p.get('contentType', []))]

    # Age range filter
    if args.min_age is not None:
        results = [p for p in results
                  if p.get('ageRange') and len(p['ageRange']) >= 2
                  and p['ageRange'][1] is not None and p['ageRange'][1] >= args.min_age]

    if args.max_age is not None:
        results = [p for p in results
                  if p.get('ageRange') and len(p['ageRange']) >= 2
                  and p['ageRange'][0] is not None and p['ageRange'][0] <= args.max_age]

    # Price range filter
    if args.min_price is not None:
        results = [p for p in results
                  if p.get('price') and float(p['price']) >= args.min_price]

    if args.max_price is not None:
        results = [p for p in results
                  if p.get('price') and float(p['price']) <= args.max_price]

    # Runtime filter (in minutes)
    if args.min_runtime is not None:
        min_seconds = args.min_runtime * 60
        results = [p for p in results
                  if p.get('runtime') and p['runtime'] >= min_seconds]

    if args.max_runtime is not None:
        max_seconds = args.max_runtime * 60
        results = [p for p in results
                  if p.get('runtime') and p['runtime'] <= max_seconds]

    # Availability filter
    if args.available_only:
        results = [p for p in results if p.get('availableForSale', False)]

    # New items filter
    if args.new_only:
        results = [p for p in results if p.get('flag') == 'New to Yoto']

    # Language filter
    if args.language:
        lang_query = args.language.lower()
        results = [p for p in results
                  if any(lang_query in lang.lower() for lang in p.get('languages', []))]

    return results

def sort_results(results: List[Dict], sort_by: str, reverse: bool = False) -> List[Dict]:
    """Sort results by specified field"""
    if sort_by == 'price':
        return sorted(results, key=lambda p: float(p.get('price', 0)), reverse=reverse)
    elif sort_by == 'runtime':
        return sorted(results, key=lambda p: p.get('runtime', 0), reverse=reverse)
    elif sort_by == 'age':
        return sorted(results, key=lambda p: p.get('ageRange', [0])[0], reverse=reverse)
    else:
        return sorted(results, key=lambda p: p.get(sort_by, ''), reverse=reverse)

def display_results(results: List[Dict], limit: int = None, format: str = 'summary'):
    """Display filtered results"""
    if limit:
        results = results[:limit]

    if format == 'summary':
        for i, p in enumerate(results, 1):
            title = p.get('title', 'Unknown')
            author = p.get('author', 'Unknown')
            price = p.get('price', 'N/A')
            age_range = p.get('ageRange', [])
            age_str = f"{age_range[0]}-{age_range[1]}" if len(age_range) >= 2 else "N/A"

            print(f"{i}. {title}")
            print(f"   {author} | £{price} | Age {age_str}")

            content_types = ', '.join(p.get('contentType', []))
            if content_types:
                print(f"   {content_types}")
            print()

    elif format == 'titles':
        for p in results:
            print(p.get('title', 'Unknown'))

    elif format == 'json':
        print(json.dumps(results, indent=2, ensure_ascii=False))

def main():
    parser = argparse.ArgumentParser(description='Advanced filtering for Yoto content')

    # Search filters
    parser.add_argument('--search', '-s', help='Search in title')
    parser.add_argument('--author', '-a', help='Filter by author')
    parser.add_argument('--content-type', '-c', help='Filter by content type')
    parser.add_argument('--language', '-l', help='Filter by language')

    # Age filters
    parser.add_argument('--min-age', type=int, help='Minimum age')
    parser.add_argument('--max-age', type=int, help='Maximum age')

    # Price filters
    parser.add_argument('--min-price', type=float, help='Minimum price')
    parser.add_argument('--max-price', type=float, help='Maximum price')

    # Runtime filters (in minutes)
    parser.add_argument('--min-runtime', type=int, help='Minimum runtime in minutes')
    parser.add_argument('--max-runtime', type=int, help='Maximum runtime in minutes')

    # Boolean filters
    parser.add_argument('--available-only', action='store_true', help='Show only available items')
    parser.add_argument('--new-only', action='store_true', help='Show only new items')

    # Sorting and display
    parser.add_argument('--sort', choices=['title', 'price', 'runtime', 'age'], default='title',
                       help='Sort by field')
    parser.add_argument('--reverse', action='store_true', help='Reverse sort order')
    parser.add_argument('--limit', type=int, help='Limit number of results')
    parser.add_argument('--format', choices=['summary', 'titles', 'json'], default='summary',
                       help='Output format')

    args = parser.parse_args()

    # Load and filter
    products = load_content()
    print(f"Total products: {len(products)}")

    results = apply_filters(products, args)
    print(f"Filtered results: {len(results)}\n")

    if results:
        results = sort_results(results, args.sort, args.reverse)
        display_results(results, args.limit, args.format)
    else:
        print("No products match your filters.")

if __name__ == '__main__':
    main()
