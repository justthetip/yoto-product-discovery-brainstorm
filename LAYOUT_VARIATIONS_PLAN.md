# Layout Variations Plan - V5 Compact Professional

## Current Context
Working on `design-explorations` branch with 5 AI chat design variations complete.
Now creating layout variations based on V5 Compact Professional design.

## Current V5 Layout
- **Two-column grid**: Chat panel (left, wider) + Product results (right, narrow 380px)
- Grid: `grid-template-columns: 1fr 380px`
- Compact, space-efficient design
- Professional styling with tight spacing

## Task List

- [ ] Analyze V5 Compact Professional layout
- [ ] Create Layout A: Horizontal Split (chat top, products bottom)
- [ ] Create Layout B: Results-First (products left wide, chat right narrow)
- [ ] Create Layout C: Single Column Stack (mobile-first vertical)
- [ ] Create navigation page for layout variations
- [ ] Update vercel.json with new routes
- [ ] Commit and deploy layout variations

## Layout Variations to Create

### Layout A: Horizontal Split
**File:** `web/ai-v5-layout-a.html`

- Chat interface: **Top half** (full width, shorter height)
- Product results: **Bottom half** (full width, scrollable)
- Grid: `grid-template-rows: 45vh 1fr`
- Better for ultrawide monitors
- Quick glance at both without horizontal scrolling

### Layout B: Results-First
**File:** `web/ai-v5-layout-b.html`

- Product results: **Left side** (wider ~60%, primary focus)
- Chat interface: **Right sidebar** (narrow ~40%, always visible)
- Grid: `grid-template-columns: 1fr 600px` (flipped from original)
- Flips priority - products are the hero
- Good for browsing while asking questions

### Layout C: Single Column Stack
**File:** `web/ai-v5-layout-c.html`

- **Vertical flow**: Chat → Results (stacked)
- Single column: `grid-template-columns: 1fr`
- Mobile-first responsive approach
- One thing at a time, natural scroll
- Best for narrow screens/focused tasks
- Max width: 900px centered

## Additional Files

### Navigation Page
**File:** `web/ai-v5-layouts.html`

- Hub page for comparing the 3 layout variations
- Preview cards showing layout diagrams
- Links to each variation

## Routes to Add to vercel.json

```json
{
  "source": "/ai-v5-layout-a",
  "destination": "/web/ai-v5-layout-a.html"
},
{
  "source": "/ai-v5-layout-b",
  "destination": "/web/ai-v5-layout-b.html"
},
{
  "source": "/ai-v5-layout-c",
  "destination": "/web/ai-v5-layout-c.html"
},
{
  "source": "/ai-v5-layouts",
  "destination": "/web/ai-v5-layouts.html"
}
```

## Design Principles
- Maintain V5 Compact Professional styling (colors, spacing, typography)
- Only change the grid layout structure
- Keep all interactive functionality the same
- Use same Yoto red (#f45436) color scheme
- Professional, space-efficient aesthetic

## Source File
Base all variations on: `/Users/lukejeffery/Projects/yoto-product-discovery-brainstorm/web/ai-v5-compact.html`
