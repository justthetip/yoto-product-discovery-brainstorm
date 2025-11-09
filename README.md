# Yoto Content Browser

Experiment with different ways to search and display content from the Yoto API.

## Quick Start - Web Interface

**The easiest way to browse content:**

### One-Command Start
```bash
./start.sh
```
This will fetch data (if needed) and start the web server automatically!

### Manual Start
1. Fetch the data:
```bash
python3 src/fetch-content.py
```

2. Start the web server:
```bash
python3 web/server.py
```

3. Open in your browser:
```
http://localhost:8000/web/
```

You'll get a mobile-first, responsive web interface with:
- Real-time search
- Advanced filtering (price, age, content type)
- Quick filter buttons
- Sortable product cards
- Detailed product modals

See [web/README.md](web/README.md) for full web interface documentation.

## Command Line Tools

The project also includes Python 3 command-line tools (no external dependencies required).

## Scripts

### 1. Fetch Content
Pulls the latest content from Yoto API:
```bash
python3 src/fetch-content.py
```

Data is saved to `data/yoto-content.json`

### 2. Statistics
View detailed statistics about the content library:
```bash
python3 src/stats.py
```

Shows:
- Price analysis and distribution
- Content type breakdown
- Top authors
- Runtime statistics
- Age range analysis
- Language distribution

### 3. Search
Basic search and statistics:
```bash
# Show statistics and examples
python3 src/search.py

# Search by title
python3 src/search.py harry potter
python3 src/search.py peppa
```

### 4. Display Modes
View content in different formats:
```bash
# Card view (default) - detailed cards
python3 src/display.py cards

# Table view - compact table
python3 src/display.py table

# JSON view - raw data
python3 src/display.py json

# Grouped by content type
python3 src/display.py grouped

# Grouped by age range
python3 src/display.py age
```

### 5. Advanced Filtering
Combine multiple filters:
```bash
# Stories for ages 3-6
python3 src/advanced-filter.py --content-type stories --min-age 3 --max-age 6

# Available items under £10
python3 src/advanced-filter.py --available-only --max-price 10

# New items by specific author
python3 src/advanced-filter.py --new-only --author "Julia Donaldson"

# Short content (under 30 minutes)
python3 src/advanced-filter.py --max-runtime 30

# Search with multiple filters, sorted by price
python3 src/advanced-filter.py --search adventure --min-age 5 --available-only --sort price

# Get just titles (e.g., for piping)
python3 src/advanced-filter.py --content-type music --format titles
```

## Filter Options

- `--search`, `-s`: Search in title
- `--author`, `-a`: Filter by author
- `--content-type`, `-c`: Filter by content type (Stories, Music, etc.)
- `--language`, `-l`: Filter by language
- `--min-age`, `--max-age`: Age range filters
- `--min-price`, `--max-price`: Price range filters (in £)
- `--min-runtime`, `--max-runtime`: Runtime filters (in minutes)
- `--available-only`: Show only items in stock
- `--new-only`: Show only new arrivals
- `--sort`: Sort by title, price, runtime, or age
- `--reverse`: Reverse sort order
- `--limit`: Limit number of results
- `--format`: Output format (summary, titles, json)

## Examples

Find affordable stories for young kids:
```bash
python3 src/advanced-filter.py --content-type stories --max-age 5 --max-price 15 --sort price
```

Find long-form content for road trips:
```bash
python3 src/advanced-filter.py --min-runtime 120 --available-only --sort runtime --reverse
```

Browse new releases:
```bash
python3 src/advanced-filter.py --new-only --format summary
```

## Data Structure

Each product includes:
- `title`, `author`, `id`
- `price`, `availableForSale`
- `ageRange` - [min, max]
- `contentType` - array of categories
- `runtime` - duration in seconds
- `languages` - array of languages
- `blurb` - description
- `images` - product images
- `tags` - detailed metadata
