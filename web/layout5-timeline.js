// Layout 5: Timeline Scroller
let allProducts = [];
let activeAgeFilter = 'all';

// Runtime categories (in seconds)
const RUNTIME_CATEGORIES = {
    quick: { max: 900, label: 'Quick Listens' },       // < 15 min
    short: { min: 900, max: 1800, label: 'Short Stories' },  // 15-30 min
    medium: { min: 1800, max: 7200, label: 'Medium Adventures' }, // 30 min - 2 hours
    long: { min: 7200, label: 'Epic Journeys' }         // 2+ hours
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    setupEventListeners();
    renderTimeline();
});

// Load products
async function loadProducts() {
    try {
        const response = await fetch('../data/yoto-content.json');
        const data = await response.json();
        allProducts = data.data.products;
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Age filter pills
    document.querySelectorAll('.age-filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.age-filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeAgeFilter = pill.dataset.age;
            renderTimeline();
        });
    });

    // Scroll to top button
    const scrollBtn = document.getElementById('scrollToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Render timeline
function renderTimeline() {
    let filteredProducts = allProducts;

    // Apply age filter
    if (activeAgeFilter !== 'all') {
        filteredProducts = filterByAge(filteredProducts, activeAgeFilter);
    }

    // Render each section
    Object.keys(RUNTIME_CATEGORIES).forEach(category => {
        const products = filterByRuntime(filteredProducts, category);
        renderSection(category, products);
    });
}

// Filter by age
function filterByAge(products, ageFilter) {
    if (ageFilter === 'all') return products;

    const [min, max] = parseAgeRange(ageFilter);

    return products.filter(p => {
        const ageRange = p.ageRange || [];
        if (ageRange.length < 2) return false;
        return ageRange[0] <= max && ageRange[1] >= min;
    });
}

// Parse age range
function parseAgeRange(ageStr) {
    if (ageStr === '12+') return [12, 14];
    const [min, max] = ageStr.split('-').map(Number);
    return [min, max];
}

// Filter by runtime
function filterByRuntime(products, category) {
    const config = RUNTIME_CATEGORIES[category];

    return products.filter(p => {
        const runtime = p.runtime || 0;
        if (runtime === 0) return false;

        if (config.min && config.max) {
            return runtime >= config.min && runtime < config.max;
        } else if (config.min) {
            return runtime >= config.min;
        } else if (config.max) {
            return runtime < config.max;
        }
        return false;
    });
}

// Render section
function renderSection(category, products) {
    const container = document.getElementById(`cards-${category}`);

    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-section">
                <p>No ${RUNTIME_CATEGORIES[category].label.toLowerCase()} found for this age group</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    // Show up to 12 products per section
    products.slice(0, 12).forEach(product => {
        const card = createTimelineCard(product);
        container.appendChild(card);
    });
}

// Create timeline card
function createTimelineCard(product) {
    const card = document.createElement('div');
    card.className = 'timeline-card';

    const imgUrl = product.imgSet?.md?.src || product.images?.[0]?.url || '';
    const price = product.price ? `£${product.price}` : 'N/A';
    const runtime = product.runtime ? formatRuntime(product.runtime) : 'N/A';

    card.innerHTML = `
        ${imgUrl ? `<img src="${imgUrl}" alt="${product.title}" class="timeline-card-image">` : '<div class="timeline-card-image"></div>'}
        <div class="timeline-card-content">
            <div class="timeline-card-title">${product.title || 'Untitled'}</div>
            <div class="timeline-card-author">${product.author || 'Unknown'}</div>
            <div class="timeline-card-footer">
                <span class="timeline-card-runtime">⏱️ ${runtime}</span>
                <span class="timeline-card-price">${price}</span>
            </div>
        </div>
    `;

    return card;
}

// Format runtime
function formatRuntime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}
