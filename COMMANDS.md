# Quick Command Reference

## 🌐 Web Interface (Easiest!)

```bash
python3 web/server.py
# Then open: http://localhost:8000/web/
```

---

## 📊 Common Tasks

### View statistics
```bash
python3 src/stats.py
```

### Search for something
```bash
python3 src/search.py [search term]

# Examples:
python3 src/search.py peppa
python3 src/search.py dinosaur
python3 src/search.py harry potter
```

### Browse by category
```bash
python3 src/display.py grouped
python3 src/display.py age
python3 src/display.py table
```

---

## 🎯 Quick Filters

### Find cheap content
```bash
python3 src/advanced-filter.py --max-price 10 --sort price
```

### New arrivals
```bash
python3 src/advanced-filter.py --new-only
```

### For specific age
```bash
# Toddlers (2-4)
python3 src/advanced-filter.py --min-age 2 --max-age 4

# Early readers (5-8)
python3 src/advanced-filter.py --min-age 5 --max-age 8
```

### By content type
```bash
python3 src/advanced-filter.py --content-type stories
python3 src/advanced-filter.py --content-type music
python3 src/advanced-filter.py --content-type learning
```

### Short or long content
```bash
# Under 30 minutes
python3 src/advanced-filter.py --max-runtime 30

# Over 2 hours
python3 src/advanced-filter.py --min-runtime 120 --sort runtime --reverse
```

---

## 🔍 Advanced Filtering

### Combine multiple filters
```bash
python3 src/advanced-filter.py \
  --content-type stories \
  --min-age 5 \
  --max-age 8 \
  --max-price 12 \
  --available-only \
  --sort price \
  --limit 10
```

### Find specific author
```bash
python3 src/advanced-filter.py --author "Julia Donaldson"
python3 src/advanced-filter.py --author "Roald Dahl"
```

---

## 💾 Update Data

```bash
python3 src/fetch-content.py
```

---

## 📱 All Filter Options

```
--search, -s           Search in title
--author, -a           Filter by author
--content-type, -c     Filter by content type
--language, -l         Filter by language

--min-age             Minimum age
--max-age             Maximum age

--min-price           Minimum price (£)
--max-price           Maximum price (£)

--min-runtime         Minimum runtime (minutes)
--max-runtime         Maximum runtime (minutes)

--available-only      Show only in-stock items
--new-only            Show only new arrivals

--sort                Sort by: title, price, runtime, age
--reverse             Reverse sort order
--limit               Limit number of results
--format              Output: summary, titles, json
```

---

## 🎨 Display Modes

```bash
python3 src/display.py cards     # Detailed view
python3 src/display.py table     # Compact table
python3 src/display.py json      # JSON format
python3 src/display.py grouped   # By content type
python3 src/display.py age       # By age range
```

---

## 📋 Examples

**Birthday shopping for 6-year-old, budget £50:**
```bash
python3 src/advanced-filter.py --min-age 5 --max-age 7 --max-price 15 --available-only --sort price
```

**Long audiobooks for road trip:**
```bash
python3 src/advanced-filter.py --min-runtime 120 --content-type stories --sort runtime --reverse --limit 20
```

**Browse all music:**
```bash
python3 src/advanced-filter.py --content-type music --format summary
```

**Find bedtime stories:**
```bash
python3 src/search.py bedtime
# or
python3 src/advanced-filter.py --content-type bedtime
```

---

**💡 Tip:** For the best experience, use the web interface at http://localhost:8000/web/
