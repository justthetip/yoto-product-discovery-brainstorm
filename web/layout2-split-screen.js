// Layout 2: Split-Screen Explorer
let allProducts = [];
let filteredProducts = [];
let activeFilters = {
    search: '',
    age: [],
    minPrice: null,
    maxPrice: null,
    contentTypes: [],
    availableOnly: false,
    newOnly: false,
    runtime: [],
    sort: 'title-asc'
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    populateContentTypes();
    setupEventListeners();
    applyFiltersAndRender();
});

// Load products
async function loadProducts() {
    try {
        const response = await fetch('../data/yoto-content.json');
        const data = await response.json();
        allProducts = data.data.products;
        document.getElementById('totalCount').textContent = `${allProducts.length} cards`;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Populate content types filter
function populateContentTypes() {
    const contentTypes = new Set();
    allProducts.forEach(p => {
        (p.contentType || []).forEach(ct => contentTypes.add(ct));
    });

    const container = document.getElementById('contentTypesFilter');
    const sorted = Array.from(contentTypes).sort();

    // Show top 10 initially
    sorted.slice(0, 10).forEach(type => {
        const count = allProducts.filter(p =>
            (p.contentType || []).includes(type)
        ).length;

        const option = document.createElement('label');
        option.className = 'filter-option';
        option.innerHTML = `
            <input type="checkbox" data-content-type="${type}">
            <span>${type}</span>
            <span class="filter-count">${count}</span>
        `;
        container.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        activeFilters.search = e.target.value.toLowerCase();
        applyFiltersAndRender();
    });

    // Sort
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        activeFilters.sort = e.target.value;
        applyFiltersAndRender();
    });

    // Age pills
    document.querySelectorAll('.age-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            const age = pill.dataset.age;
            const index = activeFilters.age.indexOf(age);

            if (index === -1) {
                activeFilters.age.push(age);
                pill.classList.add('active');
            } else {
                activeFilters.age.splice(index, 1);
                pill.classList.remove('active');
            }

            applyFiltersAndRender();
        });
    });

    // Price inputs
    document.getElementById('minPrice').addEventListener('input', (e) => {
        activeFilters.minPrice = e.target.value ? parseFloat(e.target.value) : null;
        applyFiltersAndRender();
    });

    document.getElementById('maxPrice').addEventListener('input', (e) => {
        activeFilters.maxPrice = e.target.value ? parseFloat(e.target.value) : null;
        applyFiltersAndRender();
    });

    // Content type checkboxes
    document.querySelectorAll('[data-content-type]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const type = e.target.dataset.contentType;
            if (e.target.checked) {
                activeFilters.contentTypes.push(type);
                e.target.closest('.filter-option').classList.add('active');
            } else {
                const index = activeFilters.contentTypes.indexOf(type);
                if (index !== -1) activeFilters.contentTypes.splice(index, 1);
                e.target.closest('.filter-option').classList.remove('active');
            }
            applyFiltersAndRender();
        });
    });

    // Availability checkboxes
    document.getElementById('availableOnly').addEventListener('change', (e) => {
        activeFilters.availableOnly = e.target.checked;
        applyFiltersAndRender();
    });

    document.getElementById('newOnly').addEventListener('change', (e) => {
        activeFilters.newOnly = e.target.checked;
        applyFiltersAndRender();
    });

    // Runtime checkboxes
    document.querySelectorAll('[data-runtime]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const runtime = e.target.dataset.runtime;
            if (e.target.checked) {
                activeFilters.runtime.push(runtime);
            } else {
                const index = activeFilters.runtime.indexOf(runtime);
                if (index !== -1) activeFilters.runtime.splice(index, 1);
            }
            applyFiltersAndRender();
        });
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

    // Toggle filters on mobile
    document.getElementById('toggleFiltersBtn').addEventListener('click', () => {
        document.getElementById('filtersPanel').classList.toggle('open');
        document.getElementById('filtersOverlay').classList.toggle('open');
    });

    document.getElementById('filtersOverlay').addEventListener('click', () => {
        document.getElementById('filtersPanel').classList.remove('open');
        document.getElementById('filtersOverlay').classList.remove('open');
    });

    // Collapsible filter groups
    document.querySelectorAll('.filter-group-title').forEach(title => {
        title.addEventListener('click', () => {
            title.closest('.filter-group').classList.toggle('collapsed');
        });
    });
}

// Apply filters and render
function applyFiltersAndRender() {
    filteredProducts = filterProducts();
    sortProducts();
    renderProducts();
    updateActiveFilterTags();
}

// Filter products
function filterProducts() {
    let filtered = allProducts;

    // Search
    if (activeFilters.search) {
        const searchLower = activeFilters.search;
        filtered = filtered.filter(p =>
            (p.title || '').toLowerCase().includes(searchLower) ||
            (p.author || '').toLowerCase().includes(searchLower)
        );
    }

    // Age
    if (activeFilters.age.length > 0) {
        filtered = filtered.filter(p => {
            const ageRange = p.ageRange || [];
            if (ageRange.length < 2) return false;

            return activeFilters.age.some(ageFilter => {
                const [min, max] = parseAgeRange(ageFilter);
                return ageRange[0] <= max && ageRange[1] >= min;
            });
        });
    }

    // Price
    if (activeFilters.minPrice !== null) {
        filtered = filtered.filter(p =>
            parseFloat(p.price || 0) >= activeFilters.minPrice
        );
    }
    if (activeFilters.maxPrice !== null) {
        filtered = filtered.filter(p =>
            parseFloat(p.price || 0) <= activeFilters.maxPrice
        );
    }

    // Content types
    if (activeFilters.contentTypes.length > 0) {
        filtered = filtered.filter(p =>
            (p.contentType || []).some(ct =>
                activeFilters.contentTypes.includes(ct)
            )
        );
    }

    // Availability
    if (activeFilters.availableOnly) {
        filtered = filtered.filter(p => p.availableForSale);
    }

    if (activeFilters.newOnly) {
        filtered = filtered.filter(p => p.flag === 'New to Yoto');
    }

    // Runtime
    if (activeFilters.runtime.length > 0) {
        filtered = filtered.filter(p => {
            const runtime = p.runtime || 0;
            return activeFilters.runtime.some(r => {
                if (r === 'short') return runtime < 1800;
                if (r === 'medium') return runtime >= 1800 && runtime < 7200;
                if (r === 'long') return runtime >= 7200;
                return false;
            });
        });
    }

    return filtered;
}

// Parse age range
function parseAgeRange(ageStr) {
    if (ageStr === '12+') return [12, 14];
    const [min, max] = ageStr.split('-').map(Number);
    return [min, max];
}

// Sort products
function sortProducts() {
    const [field, order] = activeFilters.sort.split('-');

    filteredProducts.sort((a, b) => {
        let aVal, bVal;

        if (field === 'price') {
            aVal = parseFloat(a.price || 0);
            bVal = parseFloat(b.price || 0);
        } else if (field === 'new') {
            aVal = a.flag === 'New to Yoto' ? 1 : 0;
            bVal = b.flag === 'New to Yoto' ? 1 : 0;
            return bVal - aVal; // Newest first
        } else {
            aVal = (a.title || '').toLowerCase();
            bVal = (b.title || '').toLowerCase();
        }

        if (order === 'desc') {
            return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        } else {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        }
    });
}

// Render products
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    const emptyState = document.getElementById('emptyState');

    grid.innerHTML = '';

    if (filteredProducts.length === 0) {
        emptyState.style.display = 'block';
        grid.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        grid.style.display = 'grid';

        filteredProducts.forEach(product => {
            const card = createProductCard(product);
            grid.appendChild(card);
        });
    }

    document.getElementById('resultCount').textContent =
        `${filteredProducts.length} ${filteredProducts.length === 1 ? 'card' : 'cards'}`;
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'yoto-card';

    const imgUrl = product.imgSet?.md?.src || product.images?.[0]?.url || '';
    const price = product.price ? `£${product.price}` : 'N/A';

    card.innerHTML = `
        ${imgUrl ? `<img src="${imgUrl}" alt="${product.title}" class="yoto-card-image">` : '<div class="yoto-card-image"></div>'}
        <div class="yoto-card-content">
            ${product.flag ? `<div class="yoto-badge yoto-badge-new">${product.flag}</div>` : ''}
            <h3 class="yoto-heading-3" style="margin: var(--space-xs) 0 4px 0;">${product.title || 'Untitled'}</h3>
            <p class="yoto-small" style="color: var(--yoto-gray-dark); margin-bottom: var(--space-sm);">${product.author || 'Unknown'}</p>
            <div style="font-weight: var(--font-weight-bold); color: var(--yoto-orange); font-size: var(--font-size-lg);">${price}</div>
        </div>
    `;

    return card;
}

// Update active filter tags
function updateActiveFilterTags() {
    const container = document.getElementById('activeFilterTags');
    container.innerHTML = '';

    const tags = [];

    if (activeFilters.search) {
        tags.push({ label: `"${activeFilters.search}"`, type: 'search' });
    }

    activeFilters.age.forEach(age => {
        tags.push({ label: `Ages ${age}`, type: 'age', value: age });
    });

    if (activeFilters.minPrice) {
        tags.push({ label: `Min £${activeFilters.minPrice}`, type: 'minPrice' });
    }

    if (activeFilters.maxPrice) {
        tags.push({ label: `Max £${activeFilters.maxPrice}`, type: 'maxPrice' });
    }

    activeFilters.contentTypes.forEach(ct => {
        tags.push({ label: ct, type: 'contentType', value: ct });
    });

    if (activeFilters.availableOnly) {
        tags.push({ label: 'In stock', type: 'availableOnly' });
    }

    if (activeFilters.newOnly) {
        tags.push({ label: 'New arrivals', type: 'newOnly' });
    }

    tags.forEach(tag => {
        const tagEl = document.createElement('div');
        tagEl.className = 'filter-tag';
        tagEl.innerHTML = `
            ${tag.label}
            <button onclick="removeFilter('${tag.type}', '${tag.value || ''}')" title="Remove filter">×</button>
        `;
        container.appendChild(tagEl);
    });
}

// Remove individual filter
function removeFilter(type, value) {
    if (type === 'search') {
        activeFilters.search = '';
        document.getElementById('searchInput').value = '';
    } else if (type === 'age') {
        const index = activeFilters.age.indexOf(value);
        if (index !== -1) activeFilters.age.splice(index, 1);
        document.querySelector(`.age-pill[data-age="${value}"]`)?.classList.remove('active');
    } else if (type === 'minPrice') {
        activeFilters.minPrice = null;
        document.getElementById('minPrice').value = '';
    } else if (type === 'maxPrice') {
        activeFilters.maxPrice = null;
        document.getElementById('maxPrice').value = '';
    } else if (type === 'contentType') {
        const index = activeFilters.contentTypes.indexOf(value);
        if (index !== -1) activeFilters.contentTypes.splice(index, 1);
        const checkbox = document.querySelector(`[data-content-type="${value}"]`);
        if (checkbox) {
            checkbox.checked = false;
            checkbox.closest('.filter-option')?.classList.remove('active');
        }
    } else if (type === 'availableOnly') {
        activeFilters.availableOnly = false;
        document.getElementById('availableOnly').checked = false;
    } else if (type === 'newOnly') {
        activeFilters.newOnly = false;
        document.getElementById('newOnly').checked = false;
    }

    applyFiltersAndRender();
}

// Clear all filters
function clearAllFilters() {
    activeFilters = {
        search: '',
        age: [],
        minPrice: null,
        maxPrice: null,
        contentTypes: [],
        availableOnly: false,
        newOnly: false,
        runtime: [],
        sort: 'title-asc'
    };

    document.getElementById('searchInput').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('sortSelect').value = 'title-asc';
    document.querySelectorAll('.age-pill').forEach(pill => pill.classList.remove('active'));
    document.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    applyFiltersAndRender();
}
