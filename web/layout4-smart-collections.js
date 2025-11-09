// Layout 4: Smart Collections
let allProducts = [];

// Collection definitions
const collections = [
    {
        id: 'new',
        title: '✨ New to Yoto',
        icon: '✨',
        filter: (p) => p.flag === 'New to Yoto',
        limit: 15
    },
    {
        id: 'roadtrip',
        title: '🚗 Perfect for Road Trips',
        icon: '🚗',
        filter: (p) => (p.runtime || 0) >= 7200, // 2+ hours
        limit: 10
    },
    {
        id: 'bedtime',
        title: '🌙 Bedtime Favorites',
        icon: '🌙',
        filter: (p) => (p.contentType || []).some(ct => ct.includes('Bedtime')),
        limit: 12
    },
    {
        id: 'toddlers',
        title: '👶 For Little Ones (0-4)',
        icon: '👶',
        filter: (p) => {
            const age = p.ageRange || [];
            return age.length >= 2 && age[0] <= 4;
        },
        limit: 12
    },
    {
        id: 'under10',
        title: '💰 Under £10',
        icon: '💰',
        filter: (p) => parseFloat(p.price || 0) < 10,
        limit: 15
    },
    {
        id: 'classics',
        title: '📚 Timeless Classics',
        icon: '📚',
        filter: (p) => (p.contentType || []).includes('Classics'),
        limit: 10
    },
    {
        id: 'music',
        title: '🎵 Music & Songs',
        icon: '🎵',
        filter: (p) => (p.contentType || []).some(ct => ct.includes('Music')),
        limit: 12
    },
    {
        id: 'learning',
        title: '🎓 Learning & Education',
        icon: '🎓',
        filter: (p) => (p.contentType || []).includes('Learning & Education'),
        limit: 10
    },
    {
        id: 'adventure',
        title: '⚔️ Action & Adventure',
        icon: '⚔️',
        filter: (p) => (p.contentType || []).includes('Action & Adventure'),
        limit: 12
    },
    {
        id: 'quick',
        title: '⚡ Quick Listens (Under 30min)',
        icon: '⚡',
        filter: (p) => (p.runtime || 0) > 0 && (p.runtime || 0) < 1800,
        limit: 10
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    updateQuickAccessCounts();
    renderCollections();
    setupEventListeners();
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
    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 2) {
            searchProducts(query);
        } else if (query.length === 0) {
            renderCollections();
        }
    });

    // Quick access cards
    document.querySelectorAll('.quick-access-card').forEach(card => {
        card.addEventListener('click', () => {
            const collectionId = card.dataset.collection;
            showCollection(collectionId);
        });
    });

    // Filter FAB
    document.getElementById('filterFab').addEventListener('click', () => {
        document.getElementById('filterDrawer').classList.toggle('open');
    });

    document.getElementById('closeDrawer').addEventListener('click', () => {
        document.getElementById('filterDrawer').classList.remove('open');
    });
}

// Update quick access counts
function updateQuickAccessCounts() {
    const counts = {
        new: allProducts.filter(p => p.flag === 'New to Yoto').length,
        bedtime: allProducts.filter(p =>
            (p.contentType || []).some(ct => ct.includes('Bedtime'))
        ).length,
        music: allProducts.filter(p =>
            (p.contentType || []).some(ct => ct.includes('Music'))
        ).length,
        under10: allProducts.filter(p => parseFloat(p.price || 0) < 10).length
    };

    Object.entries(counts).forEach(([key, count]) => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = `${count} cards`;
    });
}

// Render all collections
function renderCollections() {
    const container = document.getElementById('collectionsContainer');
    container.innerHTML = '';

    collections.forEach(collection => {
        const products = allProducts.filter(collection.filter);

        if (products.length > 0) {
            const section = createCollectionSection(collection, products);
            container.appendChild(section);
        }
    });
}

// Create collection section
function createCollectionSection(collection, products) {
    const section = document.createElement('div');
    section.className = 'collection';

    const displayProducts = products.slice(0, collection.limit);

    section.innerHTML = `
        <div class="collection-header">
            <div class="collection-title">
                <span class="collection-icon">${collection.icon}</span>
                <span>${collection.title}</span>
            </div>
            <a class="collection-see-all" data-collection="${collection.id}">
                See all ${products.length}
            </a>
        </div>
        <div class="collection-scroll" id="scroll-${collection.id}">
            ${displayProducts.map(p => createCollectionCard(p)).join('')}
        </div>
    `;

    // Add click handler to "See all"
    section.querySelector('.collection-see-all').addEventListener('click', () => {
        showCollection(collection.id);
    });

    return section;
}

// Create collection card
function createCollectionCard(product) {
    const imgUrl = product.imgSet?.sm?.src || product.images?.[0]?.url || '';
    const price = product.price ? `£${product.price}` : 'N/A';
    const author = product.author || 'Unknown';

    return `
        <div class="collection-card-wrapper">
            <div class="collection-card">
                ${product.flag ? `<div class="collection-card-badge">${product.flag}</div>` : ''}
                ${imgUrl ? `<img src="${imgUrl}" alt="${product.title}" class="collection-card-image">` : '<div class="collection-card-image"></div>'}
                <div class="collection-card-content">
                    <div class="collection-card-title">${product.title || 'Untitled'}</div>
                    <div class="collection-card-meta">${author}</div>
                    <div class="collection-card-price">${price}</div>
                </div>
            </div>
        </div>
    `;
}

// Show full collection
function showCollection(collectionId) {
    const collection = collections.find(c => c.id === collectionId);
    if (!collection) return;

    const products = allProducts.filter(collection.filter);

    const container = document.getElementById('collectionsContainer');
    container.innerHTML = `
        <div style="padding: 0 var(--space-md);">
            <button class="yoto-btn yoto-btn-secondary" onclick="renderCollections()" style="margin-bottom: var(--space-lg);">
                ← Back to Collections
            </button>
        </div>

        <div style="padding: 0 var(--space-md) var(--space-xl);">
            <h2 class="collection-title" style="margin-bottom: var(--space-md);">
                <span class="collection-icon">${collection.icon}</span>
                <span>${collection.title}</span>
            </h2>
            <p style="color: var(--yoto-gray-dark); margin-bottom: var(--space-lg);">
                ${products.length} ${products.length === 1 ? 'card' : 'cards'} in this collection
            </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-md); padding: 0 var(--space-md);">
            ${products.map(p => createCollectionCard(p)).join('')}
        </div>
    `;
}

// Search products
function searchProducts(query) {
    const results = allProducts.filter(p =>
        (p.title || '').toLowerCase().includes(query) ||
        (p.author || '').toLowerCase().includes(query) ||
        (p.contentType || []).some(ct => ct.toLowerCase().includes(query))
    );

    const container = document.getElementById('collectionsContainer');

    if (results.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--space-xxl); color: var(--yoto-gray-dark);">
                <div style="font-size: 4rem; margin-bottom: var(--space-md);">🔍</div>
                <h2>No results found</h2>
                <p>Try a different search term</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div style="padding: 0 var(--space-md) var(--space-xl);">
            <h2 class="collection-title" style="margin-bottom: var(--space-md);">
                <span class="collection-icon">🔍</span>
                <span>Search Results</span>
            </h2>
            <p style="color: var(--yoto-gray-dark); margin-bottom: var(--space-lg);">
                Found ${results.length} ${results.length === 1 ? 'card' : 'cards'} for "${query}"
            </p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-md); padding: 0 var(--space-md);">
            ${results.map(p => createCollectionCard(p)).join('')}
        </div>
    `;
}
