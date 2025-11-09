# Yoto Content Browser - Web Interface

Mobile-first responsive web interface for browsing and filtering Yoto content.

## Quick Start

1. Start the web server:
```bash
python3 web/server.py
```

2. Open in your browser:
```
http://localhost:8000/web/
```

## Features

### Mobile-First Design
- Optimized for touch interactions
- Responsive grid layout (1 column mobile, 2-3 tablet, 3-4 desktop)
- Sticky header and search bar
- Smooth scrolling and animations

### Search & Filter
- **Real-time search**: Search by title, author, or content type
- **Quick filters**: One-tap filters for common searches
  - Under £10
  - Under 30 minutes
  - 2+ hours runtime
  - Ages 2-4 (toddlers)
  - Ages 5-8 (kids)

### Advanced Filtering
- Price range (min/max)
- Age range (min/max)
- Content type (dropdown of all types)
- Sort options:
  - Title (A-Z or Z-A)
  - Price (low to high or high to low)
  - Runtime (longest or shortest)

### View Modes
- **All**: Show all products
- **New**: Show only "New to Yoto" items
- **Available**: Show only in-stock items
- **Filters**: Open advanced filter panel

### Product Display
- Product cards with:
  - Product image
  - Title and author
  - Age range and runtime
  - Content type badges (up to 2)
  - Price and availability status
- Click any card to see full details in modal:
  - Full description
  - All metadata
  - All content type categories
  - Languages

### Performance
- Lazy loading (20 products at a time)
- "Load More" button for pagination
- Debounced search (300ms delay)
- Efficient filtering and sorting

## User Interface

### Header
- Shows current filtered count
- Gradient background (orange to yellow)
- Sticky positioning

### Search Bar
- Prominent search input
- Sticky below header
- Real-time filtering

### Filter Tabs
- Horizontal scrolling on mobile
- Active state indication
- Touch-optimized sizing

### Product Grid
- Card-based layout
- Smooth hover/tap effects
- Responsive columns
- Shadow and border radius for depth

### Modal
- Full product details
- Image gallery
- Metadata grid
- Close button and tap-outside to dismiss

## Styling

### Color Palette
- Primary: Orange (#FF6B35)
- Secondary: Dark Blue (#004E89)
- Accent: Yellow-Orange (#F7931E)
- Success: Green (#4CAF50)

### Typography
- System font stack for native feel
- Clear hierarchy (titles, body, metadata)
- Optimized line heights for readability

### Spacing
- Consistent spacing scale (0.5rem to 2rem)
- Touch-friendly tap targets (min 44px)
- Adequate padding for readability

## Browser Support
- Modern browsers (Chrome, Safari, Firefox, Edge)
- iOS Safari 12+
- Android Chrome
- Progressive enhancement approach

## Files

- `index.html` - Main HTML structure
- `styles.css` - Complete styling (mobile-first)
- `app.js` - Application logic and state management
- `server.py` - Simple Python HTTP server

## Development

The interface is vanilla JavaScript (no frameworks) for:
- Fast loading
- No build step
- Easy customization
- Wide compatibility

## Customization

### Change colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #FF6B35;
    --secondary-color: #004E89;
    /* ... */
}
```

### Adjust pagination
Edit in `app.js`:
```javascript
const PRODUCTS_PER_PAGE = 20; // Change this number
```

### Modify quick filters
Add/edit quick filter chips in `index.html` and corresponding logic in `app.js` `filterProducts()` function.

## Performance Tips

The app loads all 1,383 products at once for instant filtering. For even larger datasets:
- Implement virtual scrolling
- Use server-side filtering
- Add pagination to initial load
- Implement service worker for offline caching
