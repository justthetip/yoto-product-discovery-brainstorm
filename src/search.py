#!/usr/bin/env python3
"""
Search and filter Yoto content with various criteria
"""
import json
import sys
from typing import List, Dict, Any

def load_content(filename='data/yoto-content.json') -> List[Dict[str, Any]]:
    """Load content from JSON file"""
    with open(filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data.get('data', {}).get('products', [])

def search_by_title(products: List[Dict], query: str) -> List[Dict]:
    """Search products by title (case-insensitive)"""
    query = query.lower()
    return [p for p in products if query in p.get('title', '').lower()]

def filter_by_age_range(products: List[Dict], min_age: int = None, max_age: int = None) -> List[Dict]:
    """Filter products by age range"""
    results = []
    for p in products:
        age_range = p.get('ageRange', [])
        if len(age_range) >= 2:
            product_min, product_max = age_range[0], age_range[1]

            if min_age is not None and product_max < min_age:
                continue
            if max_age is not None and product_min > max_age:
                continue
            results.append(p)
    return results

def filter_by_content_type(products: List[Dict], content_type: str) -> List[Dict]:
    """Filter products by content type"""
    content_type = content_type.lower()
    return [p for p in products
            if any(content_type in ct.lower() for ct in p.get('contentType', []))]

def filter_by_price_range(products: List[Dict], min_price: float = None, max_price: float = None) -> List[Dict]:
    """Filter products by price range"""
    results = []
    for p in products:
        try:
            price = float(p.get('price', 0))
            if min_price is not None and price < min_price:
                continue
            if max_price is not None and price > max_price:
                continue
            results.append(p)
        except (ValueError, TypeError):
            continue
    return results

def filter_by_author(products: List[Dict], author: str) -> List[Dict]:
    """Filter products by author"""
    author = author.lower()
    return [p for p in products if author in p.get('author', '').lower()]

def filter_available_only(products: List[Dict]) -> List[Dict]:
    """Filter only available products"""
    return [p for p in products if p.get('availableForSale', False)]

def sort_products(products: List[Dict], key: str = 'title', reverse: bool = False) -> List[Dict]:
    """Sort products by given key"""
    if key == 'price':
        return sorted(products, key=lambda p: float(p.get('price', 0)), reverse=reverse)
    elif key == 'runtime':
        return sorted(products, key=lambda p: p.get('runtime', 0), reverse=reverse)
    else:
        return sorted(products, key=lambda p: p.get(key, ''), reverse=reverse)

def get_all_content_types(products: List[Dict]) -> List[str]:
    """Get unique list of all content types"""
    types = set()
    for p in products:
        types.update(p.get('contentType', []))
    return sorted(types)

def get_all_authors(products: List[Dict]) -> List[str]:
    """Get unique list of all authors"""
    authors = set(p.get('author', '') for p in products if p.get('author'))
    return sorted(authors)

def print_product_summary(product: Dict):
    """Print a summary of a product"""
    title = product.get('title', 'Unknown')
    author = product.get('author', 'Unknown')
    price = product.get('price', 'N/A')
    age_range = product.get('ageRange', [])
    content_types = ', '.join(product.get('contentType', []))
    runtime_sec = product.get('runtime', 0)
    runtime_min = runtime_sec // 60 if runtime_sec else 0
    available = '✓' if product.get('availableForSale') else '✗'

    print(f"  {title}")
    print(f"    Author: {author}")
    print(f"    Price: £{price}")
    if age_range and len(age_range) >= 2:
        print(f"    Age: {age_range[0]}-{age_range[1]} years")
    if content_types:
        print(f"    Type: {content_types}")
    if runtime_min:
        hours = runtime_min // 60
        mins = runtime_min % 60
        if hours:
            print(f"    Runtime: {hours}h {mins}m")
        else:
            print(f"    Runtime: {mins}m")
    print(f"    Available: {available}")
    print()

def main():
    """Main interactive search function"""
    products = load_content()
    print(f"Loaded {len(products)} products\n")

    if len(sys.argv) > 1:
        # Command line search
        query = ' '.join(sys.argv[1:])
        results = search_by_title(products, query)
        print(f"Search results for '{query}': {len(results)} found\n")
        for product in results[:10]:
            print_product_summary(product)
    else:
        # Show statistics and examples
        print("=== Content Statistics ===")
        print(f"Total products: {len(products)}")
        print(f"Available: {len(filter_available_only(products))}")

        # Price range
        prices = [float(p.get('price', 0)) for p in products if p.get('price')]
        if prices:
            print(f"Price range: £{min(prices):.2f} - £{max(prices):.2f}")

        # Content types
        content_types = get_all_content_types(products)
        print(f"\nContent types ({len(content_types)}):")
        for ct in content_types[:10]:
            count = len(filter_by_content_type(products, ct))
            print(f"  - {ct}: {count}")
        if len(content_types) > 10:
            print(f"  ... and {len(content_types) - 10} more")

        # Top authors
        authors = get_all_authors(products)
        print(f"\nTotal authors: {len(authors)}")

        print("\n=== Sample Searches ===")
        print("python3 src/search.py <search term>")
        print("\nExample products:")
        for product in products[:3]:
            print_product_summary(product)

if __name__ == '__main__':
    main()
