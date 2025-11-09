# Yoto Product Discovery - 5 Layout Explorations

This project explores 5 different UX approaches for discovering and filtering Yoto content, all using the authentic Yoto brand design system.

## 🎨 Design System

All layouts use the official Yoto brand colors and design language:
- **Primary**: Orange (#FF6347) to Coral (#FF7961) gradients
- **Accent Colors**: Blue, Green, Yellow, Purple
- **Typography**: System fonts, bold headings, generous spacing
- **Border Radius**: Rounded corners everywhere (8px - 24px)
- **Shadows**: Soft, layered shadows for depth
- **Mobile-First**: Touch-optimized, responsive design

## 📱 Layout 1: Visual Category Grid

**Best for**: Visual browsing, mobile users, category exploration

### Concept
Browse content through beautifully illustrated category cards. Each category shows a collage preview of actual products, making it easy to see what's inside before diving in.

### Key Features
- Large visual category tiles (12 top categories)
- Product image collages in each category
- Age quick filters (0-2, 3-5, 6-8, 9+) with emoji
- Quick filter chips (New, Available, Under £10, etc.)
- Tap category → See filtered products
- Back navigation to categories

### UX Flow
1. User sees visual category grid
2. Taps a category (e.g., "Stories")
3. Products filtered by category appear
4. Can further filter by age, price, etc.
5. Back button returns to category view

### Best Used For
- Mobile browsing
- Visual learners
- Users who think in categories
- Discovery-focused shopping

---

## 💻 Layout 2: Split-Screen Explorer

**Best for**: Power users, desktop, advanced filtering

### Concept
Persistent filter panel on the left, live product results on the right. No page refreshes, instant feedback. Think: desktop e-commerce power-search.

### Key Features
- Dual-panel design (320px filters + flexible results)
- Collapsible filter groups
- Multi-select content types
- Price range inputs
- Age pills
- Runtime filters (short, medium, long)
- Active filter tags at top
- Sort options (A-Z, price, new)
- Mobile: Filters slide in from left

### UX Flow
1. User sees all products in grid
2. Selects filters from left panel
3. Results update instantly
4. Active filters shown as removable tags
5. Sort changes update immediately

### Best Used For
- Desktop users
- Advanced searching
- Comparing multiple products
- Power users who want control

---

## 📲 Layout 3: Swipeable Story Mode

**Best for**: Mobile discovery, decision-making, fun browsing

### Concept
Tinder-style card interface. One product at a time, full-screen. Swipe right to like, left to skip. Focus on making decisions, not browsing hundreds of options.

### Key Features
- Full-screen product cards
- Swipe gestures (touch + mouse)
- Like counter badge
- Filter pills at top
- Undo button
- Card stack visual (3 cards deep)
- Shuffle on filter change
- Keyboard shortcuts (←/→/Cmd+Z)

### UX Flow
1. User selects a filter (age, type, etc.)
2. Cards shuffle and appear
3. Swipe right = Like (saved)
4. Swipe left = Skip
5. Can undo last action
6. View liked items from badge

### Best Used For
- Mobile users
- Decision fatigue reduction
- Fun, engaging discovery
- Focused browsing
- Gift finding

---

## 🎬 Layout 4: Smart Collections

**Best for**: Contextual discovery, curated browsing, Netflix-style

### Concept
Horizontal scrolling collections like Netflix. Each row is a curated collection with a specific purpose (Road Trip Ready, Bedtime Favorites, etc.).

### Key Features
- 10 curated collections
  - New to Yoto
  - Perfect for Road Trips (2+ hours)
  - Bedtime Favorites
  - For Little Ones (0-4)
  - Under £10
  - Timeless Classics
  - Music & Songs
  - Learning & Education
  - Action & Adventure
  - Quick Listens (<30min)
- Quick access grid (4 shortcuts)
- Horizontal scrolling rows
- "See all" expands collection
- Search morphs to full results

### UX Flow
1. User sees curated collections
2. Scrolls horizontally through each
3. Taps "See all" for full collection
4. Or uses quick access grid
5. Search overrides with results view

### Best Used For
- Contextual shopping (road trips, bedtime, etc.)
- Serendipitous discovery
- Users who don't know what they want
- Exploration over searching

---

## ⏱️ Layout 5: Timeline Scroller

**Best for**: Time-based discovery, activity planning, unique approach

### Concept
Browse by time commitment. Products grouped into 4 runtime categories along a visual timeline. Perfect for "I have 30 minutes" or "I need something for a 3-hour drive".

### Key Features
- Visual timeline with color-coded sections
- 4 runtime categories:
  - ⚡ Quick Listens (< 15 min) - Green
  - 📖 Short Stories (15-30 min) - Blue
  - 🎭 Medium Adventures (30 min - 2 hours) - Orange
  - 🌟 Epic Journeys (2+ hours) - Purple
- Age filter pills at top
- Scroll to top button
- Alternating left/right layout (desktop)

### UX Flow
1. User sees timeline sections
2. Can filter by age at top
3. Scrolls down timeline
4. Each section shows products of that length
5. Runtime shown on each card

### Best Used For
- Activity planning
- Time-constrained situations
- Parents planning car rides
- Unique selling point
- Users who think in time blocks

---

## 🚀 Getting Started

### Quick Start
```bash
# Start the web server
python3 web/server.py

# Then open in browser:
http://localhost:8000/web/layouts-index.html
```

### Navigation
- **Layouts Index**: `layouts-index.html` - Choose which layout to try
- **Layout 1**: `layout1-category-grid.html`
- **Layout 2**: `layout2-split-screen.html`
- **Layout 3**: `layout3-swipe-mode.html`
- **Layout 4**: `layout4-smart-collections.html`
- **Layout 5**: `layout5-timeline.html`
- **Original**: `index.html` - Original comprehensive interface

## 📊 Comparison Matrix

| Layout | Mobile | Desktop | Discovery | Filtering | Speed | Fun Factor |
|--------|--------|---------|-----------|-----------|-------|------------|
| Visual Grid | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Split-Screen | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Swipe Mode | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Collections | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Timeline | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## 🎯 Use Case Recommendations

### For Mobile Shopping App
**Primary**: Layout 3 (Swipe Mode) or Layout 4 (Collections)
- Swipe Mode: Fun, engaging, decision-focused
- Collections: Contextual, easy browsing

### For Desktop Power Users
**Primary**: Layout 2 (Split-Screen)
- Fast filtering
- See many products at once
- Advanced controls

### For Mixed Audience
**Primary**: Layout 1 (Visual Grid) or Layout 4 (Collections)
- Visual Grid: Works everywhere, intuitive
- Collections: Modern, familiar pattern

### For Unique Differentiation
**Primary**: Layout 5 (Timeline) or Layout 3 (Swipe)
- Timeline: No one else does this
- Swipe: Fun factor, memorable

## 🛠️ Technical Details

### Stack
- **HTML5**: Semantic markup
- **CSS3**: Custom properties, Grid, Flexbox
- **Vanilla JavaScript**: No frameworks, ~500 lines per layout
- **Mobile-First**: Progressive enhancement
- **No Build Step**: Just open and run

### Browser Support
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- iOS Safari 14+
- Android Chrome 90+

### Performance
- All 1,383 products load once
- In-memory filtering (instant)
- Lazy rendering where appropriate
- 60fps animations
- Touch-optimized

### File Structure
```
web/
├── yoto-brand.css          # Shared design system
├── layouts-index.html      # Layout chooser
├── layout1-category-grid.html + .js
├── layout2-split-screen.html + .js
├── layout3-swipe-mode.html + .js
├── layout4-smart-collections.html + .js
└── layout5-timeline.html + .js
```

## 💡 Implementation Notes

### Shared Code
All layouts share:
- `yoto-brand.css` - Design system tokens
- Same data loading pattern
- Similar card components
- Consistent filtering logic

### Customization
Each layout is self-contained and can be:
- Customized independently
- Combined with others
- Extended with new features
- Themed differently

### Future Enhancements
- [ ] Save liked products across sessions
- [ ] Share filtered results via URL
- [ ] Compare products side-by-side
- [ ] Add to cart functionality
- [ ] Print/export filtered lists
- [ ] Dark mode variants

## 📝 Notes

All layouts use real Yoto product data (1,383 cards). The layouts are fully functional prototypes, not just mockups.

Each layout represents a different philosophy:
1. **Category-driven** (Visual Grid)
2. **Filter-driven** (Split-Screen)
3. **Decision-driven** (Swipe Mode)
4. **Context-driven** (Collections)
5. **Time-driven** (Timeline)

Choose based on your user research, business goals, and target audience!
