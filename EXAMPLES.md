# Usage Examples

## Quick Start

1. Fetch the latest data:
```bash
python3 src/fetch-content.py
```

2. Browse content:
```bash
python3 src/display.py table
```

3. Search for something:
```bash
python3 src/search.py dinosaur
```

## Common Use Cases

### Find content for a specific age
```bash
# For toddlers (2-4 years)
python3 src/advanced-filter.py --min-age 2 --max-age 4 --limit 10

# For early readers (5-7 years)
python3 src/advanced-filter.py --min-age 5 --max-age 7 --content-type stories
```

### Budget-friendly options
```bash
# Everything under £8
python3 src/advanced-filter.py --max-price 8 --available-only --sort price

# Best value (longest runtime per price)
python3 src/advanced-filter.py --min-runtime 60 --max-price 15 --sort runtime --reverse
```

### Browse by category
```bash
# Music content
python3 src/advanced-filter.py --content-type music --limit 20

# Educational content for 6-8 year olds
python3 src/advanced-filter.py --content-type learning --min-age 6 --max-age 8
```

### Find specific authors or series
```bash
# Julia Donaldson books
python3 src/advanced-filter.py --author "Julia Donaldson"

# Peppa Pig content
python3 src/search.py peppa
```

### Travel & road trip planning
```bash
# Long content (2+ hours) for car journeys
python3 src/advanced-filter.py --min-runtime 120 --sort runtime --reverse --limit 15

# Short content (under 30 min) for quick entertainment
python3 src/advanced-filter.py --max-runtime 30 --available-only
```

### Discover new content
```bash
# New arrivals
python3 src/advanced-filter.py --new-only --limit 20

# New stories for ages 5-10
python3 src/advanced-filter.py --new-only --content-type stories --min-age 5 --max-age 10
```

## Display Modes

### Overview displays
```bash
# Statistics and content type breakdown
python3 src/search.py

# Grouped by category
python3 src/display.py grouped

# Grouped by age range
python3 src/display.py age
```

### Different views
```bash
# Detailed card view
python3 src/display.py cards

# Compact table
python3 src/display.py table

# Raw JSON data
python3 src/display.py json
```

## Advanced Filtering

### Combine multiple criteria
```bash
# Affordable stories for 3-6 year olds that are available
python3 src/advanced-filter.py \
  --content-type stories \
  --min-age 3 \
  --max-age 6 \
  --max-price 12 \
  --available-only \
  --sort price

# New music content, any price
python3 src/advanced-filter.py \
  --new-only \
  --content-type music \
  --sort title

# Long adventures for older kids
python3 src/advanced-filter.py \
  --content-type adventure \
  --min-age 8 \
  --min-runtime 120 \
  --sort runtime \
  --reverse
```

### Export to text file
```bash
# Get just titles for a spreadsheet
python3 src/advanced-filter.py --content-type stories --format titles > stories.txt

# Get full JSON for further processing
python3 src/advanced-filter.py --author "Roald Dahl" --format json > roald-dahl.json
```

## Tips

- Use `--limit N` to control how many results you see
- Use `--format titles` to get a simple list (great for piping to other tools)
- Use `--sort` with `--reverse` to see highest/longest first
- Combine `--available-only` with searches to only see in-stock items
- Use partial text searches (e.g., `--content-type learn` matches "Learning & Education")
