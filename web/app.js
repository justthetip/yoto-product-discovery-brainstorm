// Global state
let allProducts = [];
let filteredProducts = [];
let displayedProducts = [];
const PRODUCTS_PER_PAGE = 20;
let currentPage = 1;

// Filter state
let activeFilters = {
    search: '',
    view: 'all',
    minPrice: null,
    maxPrice: null,
    minAge: null,
    maxAge: null,
    contentType: '',
    sortBy: 'title',
    quickFilter: null
};

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    setupEventListeners();
    populateContentTypes();
    applyFiltersAndRender();
});

// Load products from JSON
async function loadProducts() {
    try {
        const response = await fetch('../data/yoto-content.json');
        const data = await response.json();
        allProducts = data.data.products;
        console.log(`Loaded ${allProducts.length} products`);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('loading').innerHTML = '<p>Error loading products. Please refresh.</p>';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce((e) => {
        activeFilters.search = e.target.value.toLowerCase();
        resetPagination();
        applyFiltersAndRender();
    }, 300));

    // Tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            const view = e.target.dataset.view;
            activeFilters.view = view;

            // Toggle filters panel
            const filtersPanel = document.getElementById('filtersPanel');
            if (view === 'filters') {
                filtersPanel.classList.add('active');
            } else {
                filtersPanel.classList.remove('active');
                resetPagination();
                applyFiltersAndRender();
            }
        });
    });

    // Quick filters
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;

            // Toggle active state
            const wasActive = e.target.classList.contains('active');
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

            if (!wasActive) {
                e.target.classList.add('active');
                activeFilters.quickFilter = filter;
            } else {
                activeFilters.quickFilter = null;
            }

            resetPagination();
            applyFiltersAndRender();
        });
    });

    // Filter controls
    document.getElementById('applyFilters').addEventListener('click', () => {
        activeFilters.minPrice = parseFloat(document.getElementById('minPrice').value) || null;
        activeFilters.maxPrice = parseFloat(document.getElementById('maxPrice').value) || null;
        activeFilters.minAge = parseInt(document.getElementById('minAge').value) || null;
        activeFilters.maxAge = parseInt(document.getElementById('maxAge').value) || null;
        activeFilters.contentType = document.getElementById('contentType').value;
        activeFilters.sortBy = document.getElementById('sortBy').value;

        resetPagination();
        applyFiltersAndRender();

        // Switch back to all tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelector('.tab[data-view="all"]').classList.add('active');
        document.getElementById('filtersPanel').classList.remove('active');
    });

    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

    // Sort change
    document.getElementById('sortBy').addEventListener('change', (e) => {
        activeFilters.sortBy = e.target.value;
        applyFiltersAndRender();
    });

    // Load more
    document.getElementById('loadMoreBtn').addEventListener('click', () => {
        currentPage++;
        renderProducts(false);
    });

    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('productModal').addEventListener('click', (e) => {
        if (e.target.id === 'productModal') {
            closeModal();
        }
    });
}

// Populate content types dropdown
function populateContentTypes() {
    const contentTypes = new Set();
    allProducts.forEach(product => {
        (product.contentType || []).forEach(type => contentTypes.add(type));
    });

    const select = document.getElementById('contentType');
    Array.from(contentTypes).sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
    });
}

// Apply filters and render
function applyFiltersAndRender() {
    filteredProducts = filterProducts(allProducts);
    sortProducts(filteredProducts);
    renderProducts(true);
    updateStats();
    updateActiveFiltersDisplay();
}

// Filter products
function filterProducts(products) {
    return products.filter(product => {
        // Search filter
        if (activeFilters.search) {
            const searchLower = activeFilters.search;
            const matchesSearch =
                (product.title || '').toLowerCase().includes(searchLower) ||
                (product.author || '').toLowerCase().includes(searchLower) ||
                (product.contentType || []).some(ct => ct.toLowerCase().includes(searchLower));

            if (!matchesSearch) return false;
        }

        // View filter
        if (activeFilters.view === 'new' && product.flag !== 'New to Yoto') {
            return false;
        }
        if (activeFilters.view === 'available' && !product.availableForSale) {
            return false;
        }

        // Quick filters
        if (activeFilters.quickFilter) {
            const price = parseFloat(product.price || 0);
            const runtime = product.runtime || 0;
            const ageRange = product.ageRange || [];

            switch (activeFilters.quickFilter) {
                case 'under10':
                    if (price >= 10) return false;
                    break;
                case 'short':
                    if (runtime >= 1800) return false; // 30 min
                    break;
                case 'long':
                    if (runtime < 7200) return false; // 2 hours
                    break;
                case 'toddler':
                    if (ageRange.length < 2 || ageRange[0] > 4 || ageRange[1] < 2) return false;
                    break;
                case 'kids':
                    if (ageRange.length < 2 || ageRange[0] > 8 || ageRange[1] < 5) return false;
                    break;
            }
        }

        // Price filter
        if (activeFilters.minPrice !== null) {
            const price = parseFloat(product.price || 0);
            if (price < activeFilters.minPrice) return false;
        }
        if (activeFilters.maxPrice !== null) {
            const price = parseFloat(product.price || 0);
            if (price > activeFilters.maxPrice) return false;
        }

        // Age filter
        if (activeFilters.minAge !== null || activeFilters.maxAge !== null) {
            const ageRange = product.ageRange || [];
            if (ageRange.length < 2) return false;

            if (activeFilters.minAge !== null && (ageRange[1] === null || ageRange[1] < activeFilters.minAge)) {
                return false;
            }
            if (activeFilters.maxAge !== null && (ageRange[0] === null || ageRange[0] > activeFilters.maxAge)) {
                return false;
            }
        }

        // Content type filter
        if (activeFilters.contentType) {
            const hasType = (product.contentType || []).includes(activeFilters.contentType);
            if (!hasType) return false;
        }

        return true;
    });
}

// Sort products
function sortProducts(products) {
    const [field, order] = activeFilters.sortBy.split('-');

    products.sort((a, b) => {
        let aVal, bVal;

        switch (field) {
            case 'price':
                aVal = parseFloat(a.price || 0);
                bVal = parseFloat(b.price || 0);
                break;
            case 'runtime':
                aVal = a.runtime || 0;
                bVal = b.runtime || 0;
                break;
            case 'title':
            default:
                aVal = (a.title || '').toLowerCase();
                bVal = (b.title || '').toLowerCase();
        }

        if (aVal < bVal) return order === 'desc' ? 1 : -1;
        if (aVal > bVal) return order === 'desc' ? -1 : 1;
        return 0;
    });
}

// Render products
function renderProducts(reset = false) {
    const grid = document.getElementById('productsGrid');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    loading.style.display = 'none';

    if (reset) {
        grid.innerHTML = '';
        currentPage = 1;
    }

    if (filteredProducts.length === 0) {
        emptyState.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return;
    }

    emptyState.style.display = 'none';

    const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIdx = startIdx + PRODUCTS_PER_PAGE;
    const productsToShow = filteredProducts.slice(startIdx, endIdx);

    productsToShow.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });

    // Show/hide load more button
    if (endIdx < filteredProducts.length) {
        loadMoreContainer.style.display = 'block';
    } else {
        loadMoreContainer.style.display = 'none';
    }
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductDetail(product);

    const imageUrl = product.imgSet?.md?.src || product.images?.[0]?.url || '';
    const price = product.price ? `£${product.price}` : 'N/A';
    const ageRange = product.ageRange?.length >= 2 ?
        `${product.ageRange[0]}-${product.ageRange[1]} yrs` : 'N/A';
    const runtime = product.runtime ? formatRuntime(product.runtime) : null;
    const isAvailable = product.availableForSale;

    card.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${product.title}" class="product-image">` : ''}
        <div class="product-content">
            <div class="product-header">
                <h3 class="product-title">${product.title || 'Untitled'}</h3>
                <p class="product-author">${product.author || 'Unknown'}</p>
            </div>

            <div class="product-meta">
                <span class="meta-item">📅 ${ageRange}</span>
                ${runtime ? `<span class="meta-item">⏱️ ${runtime}</span>` : ''}
            </div>

            ${product.contentType?.length ? `
                <div class="product-types">
                    ${product.contentType.slice(0, 2).map(type =>
                        `<span class="type-badge">${type}</span>`
                    ).join('')}
                </div>
            ` : ''}

            <div class="product-footer">
                <div class="product-price">${price}</div>
                <div class="availability ${isAvailable ? 'available' : 'unavailable'}">
                    ${isAvailable ? '✓ Available' : 'Out of stock'}
                </div>
            </div>
        </div>
    `;

    return card;
}

// Show product detail modal
function showProductDetail(product) {
    const modal = document.getElementById('productModal');
    const modalBody = document.getElementById('modalBody');

    const imageUrl = product.imgSet?.lg?.src || product.images?.[0]?.url || '';
    const price = product.price ? `£${product.price}` : 'N/A';
    const ageRange = product.ageRange?.length >= 2 ?
        `${product.ageRange[0]}-${product.ageRange[1]} years` : 'N/A';
    const runtime = product.runtime ? formatRuntime(product.runtime) : 'N/A';

    modalBody.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${product.title}" class="modal-image">` : ''}
        <h2 class="modal-title">${product.title || 'Untitled'}</h2>
        <p class="modal-author">by ${product.author || 'Unknown'}</p>

        ${product.blurb ? `<p class="modal-description">${product.blurb}</p>` : ''}

        <div class="modal-meta">
            <div class="modal-meta-item">
                <div class="modal-meta-label">Price</div>
                <div class="modal-meta-value">${price}</div>
            </div>
            <div class="modal-meta-item">
                <div class="modal-meta-label">Age Range</div>
                <div class="modal-meta-value">${ageRange}</div>
            </div>
            <div class="modal-meta-item">
                <div class="modal-meta-label">Runtime</div>
                <div class="modal-meta-value">${runtime}</div>
            </div>
            <div class="modal-meta-item">
                <div class="modal-meta-label">Availability</div>
                <div class="modal-meta-value">${product.availableForSale ? '✓ In Stock' : 'Out of Stock'}</div>
            </div>
        </div>

        ${product.contentType?.length ? `
            <div class="modal-meta-item">
                <div class="modal-meta-label">Categories</div>
                <div class="product-types" style="margin-top: 8px;">
                    ${product.contentType.map(type =>
                        `<span class="type-badge">${type}</span>`
                    ).join('')}
                </div>
            </div>
        ` : ''}

        ${product.languages?.length ? `
            <div class="modal-meta-item" style="margin-top: 16px;">
                <div class="modal-meta-label">Languages</div>
                <div class="modal-meta-value">${product.languages.join(', ')}</div>
            </div>
        ` : ''}
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Update stats
function updateStats() {
    document.getElementById('totalCount').textContent = filteredProducts.length;
}

// Update active filters display
function updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFilters');
    container.innerHTML = '';

    const tags = [];

    if (activeFilters.search) {
        tags.push({ label: `Search: ${activeFilters.search}`, key: 'search' });
    }
    if (activeFilters.minPrice !== null) {
        tags.push({ label: `Min: £${activeFilters.minPrice}`, key: 'minPrice' });
    }
    if (activeFilters.maxPrice !== null) {
        tags.push({ label: `Max: £${activeFilters.maxPrice}`, key: 'maxPrice' });
    }
    if (activeFilters.minAge !== null) {
        tags.push({ label: `Age: ${activeFilters.minAge}+`, key: 'minAge' });
    }
    if (activeFilters.maxAge !== null) {
        tags.push({ label: `Age: ${activeFilters.maxAge}-`, key: 'maxAge' });
    }
    if (activeFilters.contentType) {
        tags.push({ label: activeFilters.contentType, key: 'contentType' });
    }

    tags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'filter-tag';
        tagEl.innerHTML = `
            ${tag.label}
            <button onclick="removeFilter('${tag.key}')">&times;</button>
        `;
        container.appendChild(tagEl);
    });
}

// Remove individual filter
function removeFilter(key) {
    activeFilters[key] = key.includes('Price') || key.includes('Age') ? null : '';

    // Clear UI
    const element = document.getElementById(key);
    if (element) {
        element.value = '';
    }

    resetPagination();
    applyFiltersAndRender();
}

// Clear all filters
function clearAllFilters() {
    activeFilters = {
        search: '',
        view: 'all',
        minPrice: null,
        maxPrice: null,
        minAge: null,
        maxAge: null,
        contentType: '',
        sortBy: 'title',
        quickFilter: null
    };

    // Clear UI
    document.getElementById('searchInput').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('minAge').value = '';
    document.getElementById('maxAge').value = '';
    document.getElementById('contentType').value = '';
    document.getElementById('sortBy').value = 'title';
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));

    resetPagination();
    applyFiltersAndRender();
}

// Helper functions
function formatRuntime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function resetPagination() {
    currentPage = 1;
}
