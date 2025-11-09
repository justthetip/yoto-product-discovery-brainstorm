#!/usr/bin/env python3
"""
Fetch search results from Yoto API
This tries to use the API endpoint with query parameters
"""
import json
import urllib.request
import urllib.error
import sys

def fetch_yoto_search(query='', collection='library'):
    """Fetch content from Yoto API with optional search query"""
    # Try API endpoint with query parameter
    if query:
        url = f'https://api.yotoplay.com/products/v2/uk?collection={collection}&q={urllib.parse.quote(query)}'
    else:
        url = f'https://api.yotoplay.com/products/v2/uk?collection={collection}'

    headers = {
        'Host': 'api.yotoplay.com',
        'Authorization': 'e3c1d0abb70c59ad66f689f3b3d2d43c',
        'X-Render-Context': 'csr',
        'X-Route': f'/collections/{collection}',
        'X-Page-Context': 'plp',
        'X-Client': 'web-storefront',
        'Accept': '*/*',
        'Origin': 'https://uk.yotoplay.com',
        'Referer': 'https://uk.yotoplay.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    }

    try:
        print(f"Fetching: {url}")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            return data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        return None
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

def print_results(data, query=''):
    """Print search results"""
    if not data or 'data' not in data:
        print("No results found")
        return

    products = data.get('data', {}).get('products', [])
    info = data.get('data', {}).get('info', {})

    if query:
        print(f"\nSearch results for '{query}':")
    else:
        print("\nAll products:")

    print(f"Total found: {info.get('total', len(products))}")
    print(f"Showing: {len(products)} products\n")

    for i, p in enumerate(products, 1):
        title = p.get('title', 'Unknown')
        author = p.get('author', 'Unknown')
        price = p.get('price', 'N/A')
        print(f"{i}. {title}")
        print(f"   by {author} - £{price}")
        print()

if __name__ == '__main__':
    query = ' '.join(sys.argv[1:]) if len(sys.argv) > 1 else ''

    print("Searching Yoto content via API...")
    if query:
        print(f"Query: {query}")

    # Note: The API might not support query parameter for search
    # If it doesn't work, we fall back to local filtering
    data = fetch_yoto_search(query)

    if data:
        products = data.get('data', {}).get('products', [])

        if query and len(products) == data.get('data', {}).get('info', {}).get('total', 0):
            # API didn't filter, do local filtering
            print("\nNote: API doesn't appear to support search parameter.")
            print("Performing local filtering instead...")

            query_lower = query.lower()
            filtered = [p for p in products
                       if query_lower in p.get('title', '').lower()
                       or query_lower in p.get('author', '').lower()
                       or query_lower in ' '.join(p.get('contentType', [])).lower()]

            # Create filtered data structure
            data['data']['products'] = filtered
            data['data']['info']['total'] = len(filtered)

        print_results(data, query)
    else:
        print("\nFailed to fetch results. You can use the local search instead:")
        print(f"  python3 src/search.py {query}")
