# Quick Start Guide

## 🤖 AI Search (NEW!)

**Get AI-powered search in 5 minutes:**

```bash
# 1. Get API key from console.anthropic.com
# 2. Create .env file
echo "ANTHROPIC_API_KEY=sk-ant-your-key-here" > .env

# 3. Start local server
vercel dev

# 4. Visit: http://localhost:3000/ai-chat
```

**Try queries like:**
- "Find calming bedtime stories for my 4-year-old under 20 minutes"
- "Show me educational content about space"

👉 **Full AI setup guide**: [AI-SEARCH-README.md](AI-SEARCH-README.md)

---

## 📊 Command Line Tools

### 5-Second Start

```bash
# Fetch latest data
python3 src/fetch-content.py

# Browse everything
python3 src/display.py table
```

## Common Tasks

### "Show me everything"
```bash
python3 src/stats.py
```

### "I want stories for my 5-year-old"
```bash
python3 src/advanced-filter.py --content-type stories --min-age 4 --max-age 6
```

### "What's new and cheap?"
```bash
python3 src/advanced-filter.py --new-only --max-price 10 --sort price
```

### "Find me something about dinosaurs"
```bash
python3 src/search.py dinosaur
```

### "Long content for a road trip"
```bash
python3 src/advanced-filter.py --min-runtime 120 --sort runtime --reverse
```

## Scripts Overview

| Script | Purpose | Example |
|--------|---------|---------|
| `fetch-content.py` | Download latest Yoto data | `python3 src/fetch-content.py` |
| `stats.py` | View library statistics | `python3 src/stats.py` |
| `search.py` | Simple title search | `python3 src/search.py peppa` |
| `display.py` | View data in different formats | `python3 src/display.py table` |
| `advanced-filter.py` | Complex multi-criteria filtering | See examples below |

## Most Useful Filters

**Age-appropriate content:**
```bash
--min-age 3 --max-age 6
```

**Budget-friendly:**
```bash
--max-price 10
```

**Only show available items:**
```bash
--available-only
```

**Specific category:**
```bash
--content-type stories
# or: music, learning, adventure, etc.
```

**New arrivals:**
```bash
--new-only
```

**Sort results:**
```bash
--sort price    # or: title, runtime, age
--reverse       # highest/longest first
```

## Display Modes

```bash
python3 src/display.py cards    # Detailed view
python3 src/display.py table    # Compact table
python3 src/display.py grouped  # By category
python3 src/display.py age      # By age group
```

## Real Examples

**Bedtime stories under £10 for toddlers:**
```bash
python3 src/advanced-filter.py \
  --content-type bedtime \
  --max-age 4 \
  --max-price 10 \
  --available-only
```

**New music for any age, sorted alphabetically:**
```bash
python3 src/advanced-filter.py \
  --new-only \
  --content-type music \
  --sort title
```

**Julia Donaldson books:**
```bash
python3 src/advanced-filter.py --author "Julia Donaldson"
```

**Harry Potter series:**
```bash
python3 src/search.py harry
```

For more examples, see [EXAMPLES.md](EXAMPLES.md)
