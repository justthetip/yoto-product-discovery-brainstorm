#!/usr/bin/env python3
"""
Fetch content from Yoto API and save to JSON file
"""
import json
import urllib.request
import urllib.error

def fetch_yoto_content(collection='library'):
    """Fetch content from Yoto API"""
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

def save_content(data, filename='data/yoto-content.json'):
    """Save content to JSON file"""
    import os
    os.makedirs(os.path.dirname(filename), exist_ok=True)

    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Saved content to {filename}")

if __name__ == '__main__':
    print("Fetching Yoto content...")
    content = fetch_yoto_content()

    if content:
        save_content(content)

        # Print summary
        if 'products' in content:
            print(f"\nFetched {len(content['products'])} products")
            if content['products']:
                print("\nSample product:")
                sample = content['products'][0]
                for key in ['title', 'id', 'category', 'price']:
                    if key in sample:
                        print(f"  {key}: {sample[key]}")
    else:
        print("Failed to fetch content")
