// Layout 1: Visual Category Grid
let allProducts = [];
let activeFilters = {
    search: '',
    age: null,
    category: null,
    quickFilter: null
};

// Category icons and colors
const categoryConfig = {
    'Stories': { icon: '📚', color: '#FF6347' },
    'Music': { icon: '🎵', color: '#5B8DE5' },
    'Learning & Education': { icon: '🎓', color: '#4ECE7A' },
    'Favourite Characters': { icon: '⭐', color: '#FFD166' },
    'Action & Adventure': { icon: '⚔️', color: '#6B5CA5' },
    'Animal Stories': { icon: '🐻', color: '#FF9B71' },
    'Bedtime Stories': { icon: '🌙', color: '#9B8DE5' },
    'Fantasy': { icon: '🧙', color: '#B565A7' },
    'Funny Stories': { icon: '😄', color: '#FFB84D' },
    'Classics': { icon: '📖', color: '#7A6B5D' },
    'Kids\' Pop': { icon: '🎤', color: '#FF6B9D' },
    'Holidays & Celebrations': { icon: '🎉', color: '#FF6347' }
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    renderCategories();
    setupEventListeners();
});

// Load products
async function loadProducts() {
    try {
        const response = await fetch('../data/yoto-content.json');
        const data = await response.json();
        allProducts = data.data.products;
        updateProductCount(allProducts.length);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        if (activeFilters.search || activeFilters.category) {
            filterAndShowProducts();
        }
    });

    // Age filters
    document.querySelectorAll('.age-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wasActive = btn.classList.contains('active');

            document.querySelectorAll('.age-filter-btn').forEach(b => b.classList.remove('active'));

            if (!wasActive) {
                btn.classList.add('active');
                activeFilters.age = btn.dataset.age;
            } else {
                activeFilters.age = null;
            }

            if (activeFilters.category) {
                filterAndShowProducts();
            }
        });
    });

    // Quick filter chips
    document.querySelectorAll('.yoto-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const wasActive = chip.classList.contains('active');

            document.querySelectorAll('.yoto-chip').forEach(c => c.classList.remove('active'));

            if (!wasActive) {
                chip.classList.add('active');
                activeFilters.quickFilter = chip.dataset.filter;
            } else {
                activeFilters.quickFilter = null;
            }

            filterAndShowProducts();
        });
    });

    // Back button
    document.getElementById('backButton').addEventListener('click', () => {
        showCategories();
    });
}

// Render categories
function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';

    // Get category counts
    const categoryCounts = {};
    allProducts.forEach(product => {
        (product.contentType || []).forEach(cat => {
            categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
    });

    // Sort by count and get top categories
    const topCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

    topCategories.forEach(([categoryName, count]) => {
        const card = createCategoryCard(categoryName, count);
        grid.appendChild(card);
    });
}

// Create category card
function createCategoryCard(categoryName, count) {
    const card = document.createElement('div');
    card.className = 'category-card';

    // Get sample products for this category
    const categoryProducts = allProducts
        .filter(p => (p.contentType || []).includes(categoryName))
        .slice(0, 6);

    const config = categoryConfig[categoryName] || { icon: '🎯', color: '#FF6347' };

    card.innerHTML = `
        <div class="category-card-images">
            ${categoryProducts.slice(0, 6).map(p => {
                const imgUrl = p.imgSet?.sm?.src || p.images?.[0]?.url || '';
                return imgUrl ? `<img src="${imgUrl}" alt="" class="category-thumb">` : '<div class="category-thumb"></div>';
            }).join('')}
        </div>
        <div class="category-card-content">
            <div class="category-icon">${config.icon}</div>
            <div class="category-name">${categoryName}</div>
            <div class="category-count">${count} ${count === 1 ? 'card' : 'cards'}</div>
        </div>
    `;

    card.addEventListener('click', () => {
        activeFilters.category = categoryName;
        filterAndShowProducts();
    });

    return card;
}

// Filter and show products
function filterAndShowProducts() {
    let filtered = allProducts;

    // Apply category filter
    if (activeFilters.category) {
        filtered = filtered.filter(p =>
            (p.contentType || []).includes(activeFilters.category)
        );
    }

    // Apply search filter
    if (activeFilters.search) {
        const searchLower = activeFilters.search;
        filtered = filtered.filter(p =>
            (p.title || '').toLowerCase().includes(searchLower) ||
            (p.author || '').toLowerCase().includes(searchLower)
        );
    }

    // Apply age filter
    if (activeFilters.age) {
        const [minAge, maxAge] = parseAgeRange(activeFilters.age);
        filtered = filtered.filter(p => {
            const ageRange = p.ageRange || [];
            if (ageRange.length < 2) return false;
            return ageRange[0] <= maxAge && ageRange[1] >= minAge;
        });
    }

    // Apply quick filter
    if (activeFilters.quickFilter) {
        filtered = applyQuickFilter(filtered, activeFilters.quickFilter);
    }

    renderProducts(filtered);
    showProducts();
}

// Parse age range
function parseAgeRange(ageStr) {
    if (ageStr === '9+') return [9, 14];
    const [min, max] = ageStr.split('-').map(Number);
    return [min, max];
}

// Apply quick filter
function applyQuickFilter(products, filter) {
    switch (filter) {
        case 'new':
            return products.filter(p => p.flag === 'New to Yoto');
        case 'available':
            return products.filter(p => p.availableForSale);
        case 'under10':
            return products.filter(p => parseFloat(p.price || 0) < 10);
        case 'music':
            return products.filter(p => (p.contentType || []).some(ct => ct.includes('Music')));
        case 'bedtime':
            return products.filter(p => (p.contentType || []).some(ct => ct.includes('Bedtime')));
        default:
            return products;
    }
}

// Render products
function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    products.slice(0, 20).forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });

    updateFilterSummary(products.length);
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'yoto-card';

    const imgUrl = product.imgSet?.md?.src || product.images?.[0]?.url || '';
    const price = product.price ? `£${product.price}` : 'N/A';
    const ageRange = product.ageRange?.length >= 2 ?
        `${product.ageRange[0]}-${product.ageRange[1]} yrs` : '';

    card.innerHTML = `
        ${imgUrl ? `<img src="${imgUrl}" alt="${product.title}" class="yoto-card-image">` : '<div class="yoto-card-image"></div>'}
        <div class="yoto-card-content">
            ${product.flag ? `<span class="yoto-badge yoto-badge-new">${product.flag}</span>` : ''}
            <h3 class="yoto-heading-3" style="margin-top: var(--space-xs); margin-bottom: 4px;">${product.title || 'Untitled'}</h3>
            <p class="yoto-small" style="color: var(--yoto-gray-dark); margin-bottom: var(--space-sm);">${product.author || 'Unknown'}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: var(--font-weight-bold); color: var(--yoto-orange); font-size: var(--font-size-lg);">${price}</span>
                ${ageRange ? `<span class="yoto-badge yoto-badge-age">${ageRange}</span>` : ''}
            </div>
        </div>
    `;

    return card;
}

// Show/hide sections
function showCategories() {
    document.getElementById('categorySection').style.display = 'block';
    document.getElementById('productsSection').classList.remove('active');
    activeFilters.category = null;
    activeFilters.search = '';
    document.getElementById('searchInput').value = '';
}

function showProducts() {
    document.getElementById('categorySection').style.display = 'none';
    document.getElementById('productsSection').classList.add('active');
}

// Update filter summary
function updateFilterSummary(count) {
    const tagsContainer = document.getElementById('filterTags');
    tagsContainer.innerHTML = '';

    if (activeFilters.category) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            ${activeFilters.category}
            <button onclick="removeFilter('category')">×</button>
        `;
        tagsContainer.appendChild(tag);
    }

    if (activeFilters.age) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            Ages ${activeFilters.age}
            <button onclick="removeFilter('age')">×</button>
        `;
        tagsContainer.appendChild(tag);
    }

    if (activeFilters.search) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            "${activeFilters.search}"
            <button onclick="removeFilter('search')">×</button>
        `;
        tagsContainer.appendChild(tag);
    }

    document.getElementById('resultCount').textContent = `${count} ${count === 1 ? 'card' : 'cards'}`;
}

// Remove filter
function removeFilter(type) {
    activeFilters[type] = null;

    if (type === 'age') {
        document.querySelectorAll('.age-filter-btn').forEach(btn => btn.classList.remove('active'));
    } else if (type === 'search') {
        document.getElementById('searchInput').value = '';
    }

    if (!activeFilters.category && !activeFilters.search) {
        showCategories();
    } else {
        filterAndShowProducts();
    }
}

// Update product count
function updateProductCount(count) {
    document.getElementById('productCount').textContent = `${count} cards`;
}
