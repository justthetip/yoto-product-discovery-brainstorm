// Layout 3: Swipeable Story Mode
let allProducts = [];
let currentStack = [];
let currentIndex = 0;
let likedProducts = [];
let history = [];
let activeFilter = 'all';

let startX = 0;
let startY = 0;
let currentX = 0;
let currentY = 0;
let isDragging = false;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    setupEventListeners();
    applyFilter('all');
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
    // Filter pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            applyFilter(pill.dataset.filter);
        });
    });

    // Action buttons
    document.getElementById('skipBtn').addEventListener('click', () => swipeLeft());
    document.getElementById('likeBtn').addEventListener('click', () => swipeRight());
    document.getElementById('undoBtn').addEventListener('click', () => undo());

    // Liked count badge
    document.getElementById('likedCount').addEventListener('click', () => {
        if (likedProducts.length > 0) {
            alert(`Liked cards:\n\n${likedProducts.map(p => `• ${p.title}`).join('\n')}`);
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') swipeLeft();
        if (e.key === 'ArrowRight') swipeRight();
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) undo();
    });
}

// Apply filter
function applyFilter(filter) {
    activeFilter = filter;
    currentIndex = 0;
    history = [];

    // Filter products
    let filtered = allProducts;

    switch (filter) {
        case 'ages-0-2':
            filtered = filtered.filter(p => {
                const age = p.ageRange || [];
                return age.length >= 2 && age[0] <= 2 && age[1] >= 0;
            });
            break;
        case 'ages-3-5':
            filtered = filtered.filter(p => {
                const age = p.ageRange || [];
                return age.length >= 2 && age[0] <= 5 && age[1] >= 3;
            });
            break;
        case 'ages-6-8':
            filtered = filtered.filter(p => {
                const age = p.ageRange || [];
                return age.length >= 2 && age[0] <= 8 && age[1] >= 6;
            });
            break;
        case 'ages-9+':
            filtered = filtered.filter(p => {
                const age = p.ageRange || [];
                return age.length >= 2 && age[1] >= 9;
            });
            break;
        case 'new':
            filtered = filtered.filter(p => p.flag === 'New to Yoto');
            break;
        case 'stories':
            filtered = filtered.filter(p =>
                (p.contentType || []).some(ct => ct.includes('Stories'))
            );
            break;
        case 'music':
            filtered = filtered.filter(p =>
                (p.contentType || []).some(ct => ct.includes('Music'))
            );
            break;
        case 'under10':
            filtered = filtered.filter(p => parseFloat(p.price || 0) < 10);
            break;
    }

    // Shuffle
    currentStack = shuffleArray([...filtered]);
    updateStackCount();
    renderNextCard();
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Render next card
function renderNextCard() {
    const container = document.getElementById('cardStack');
    const noCards = document.getElementById('noCards');

    if (currentIndex >= currentStack.length) {
        noCards.classList.add('active');
        container.innerHTML = '';
        return;
    }

    noCards.classList.remove('active');
    container.innerHTML = '';

    // Render next 3 cards for stack effect
    for (let i = 0; i < 3 && currentIndex + i < currentStack.length; i++) {
        const product = currentStack[currentIndex + i];
        const card = createSwipeCard(product, i);
        container.appendChild(card);
    }

    // Add touch/mouse events to top card
    const topCard = container.querySelector('.swipe-card');
    if (topCard) {
        addSwipeListeners(topCard);
    }
}

// Create swipe card
function createSwipeCard(product, stackIndex) {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.style.transform = `scale(${1 - stackIndex * 0.05}) translateY(${stackIndex * 10}px)`;
    card.style.zIndex = 100 - stackIndex;

    const imgUrl = product.imgSet?.lg?.src || product.images?.[0]?.url || '';
    const price = product.price ? `£${product.price}` : 'N/A';
    const ageRange = product.ageRange?.length >= 2 ?
        `${product.ageRange[0]}-${product.ageRange[1]} yrs` : 'N/A';
    const runtime = product.runtime ? formatRuntime(product.runtime) : 'N/A';

    card.innerHTML = `
        <div class="swipe-hint">
            <span class="hint-left">SKIP</span>
            <span class="hint-right">LIKE</span>
        </div>

        ${imgUrl ? `<img src="${imgUrl}" alt="${product.title}" class="card-image">` : '<div class="card-image"></div>'}

        <div class="card-content">
            <div class="card-badges">
                ${product.flag ? `<span class="yoto-badge yoto-badge-new">${product.flag}</span>` : ''}
                ${product.availableForSale ? '<span class="yoto-badge yoto-badge-available">In Stock</span>' : ''}
            </div>

            <h2 class="card-title">${product.title || 'Untitled'}</h2>
            <p class="card-author">by ${product.author || 'Unknown'}</p>

            <p class="card-description">${product.blurb || 'No description available'}</p>

            <div class="card-meta">
                <div class="meta-item">
                    <div class="meta-label">Age Range</div>
                    <div class="meta-value">${ageRange}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-label">Runtime</div>
                    <div class="meta-value">${runtime}</div>
                </div>
            </div>

            <div class="card-price">${price}</div>
        </div>
    `;

    return card;
}

// Add swipe listeners
function addSwipeListeners(card) {
    // Touch events
    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    // Mouse events
    card.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// Touch handlers
function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    isDragging = true;
    e.currentTarget.classList.add('swiping');
}

function handleTouchMove(e) {
    if (!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    currentX = touch.clientX - startX;
    currentY = touch.clientY - startY;

    const card = e.currentTarget;
    const rotation = currentX / 20;

    card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
}

function handleTouchEnd(e) {
    if (!isDragging) return;

    const card = e.currentTarget;
    card.classList.remove('swiping');

    if (Math.abs(currentX) > 100) {
        if (currentX > 0) {
            handleSwipeRight();
        } else {
            handleSwipeLeft();
        }
    } else {
        card.style.transform = '';
    }

    isDragging = false;
    currentX = 0;
    currentY = 0;
}

// Mouse handlers
function handleMouseDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    isDragging = true;
    e.currentTarget.classList.add('swiping');
}

function handleMouseMove(e) {
    if (!isDragging) return;

    currentX = e.clientX - startX;
    currentY = e.clientY - startY;

    const card = document.querySelector('.swipe-card.swiping');
    if (!card) return;

    const rotation = currentX / 20;
    card.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${rotation}deg)`;
}

function handleMouseUp() {
    if (!isDragging) return;

    const card = document.querySelector('.swipe-card.swiping');
    if (!card) {
        isDragging = false;
        return;
    }

    card.classList.remove('swiping');

    if (Math.abs(currentX) > 100) {
        if (currentX > 0) {
            handleSwipeRight();
        } else {
            handleSwipeLeft();
        }
    } else {
        card.style.transform = '';
    }

    isDragging = false;
    currentX = 0;
    currentY = 0;
}

// Swipe actions
function swipeLeft() {
    const card = document.querySelector('.swipe-card');
    if (!card) return;

    card.classList.add('swiped-left');
    setTimeout(() => handleSwipeLeft(), 300);
}

function swipeRight() {
    const card = document.querySelector('.swipe-card');
    if (!card) return;

    card.classList.add('swiped-right');
    setTimeout(() => handleSwipeRight(), 300);
}

function handleSwipeLeft() {
    history.push({ index: currentIndex, action: 'skip' });
    currentIndex++;
    updateStackCount();
    renderNextCard();
}

function handleSwipeRight() {
    const product = currentStack[currentIndex];
    likedProducts.push(product);
    updateLikedCount();

    history.push({ index: currentIndex, action: 'like' });
    currentIndex++;
    updateStackCount();
    renderNextCard();
}

function undo() {
    if (history.length === 0) return;

    const lastAction = history.pop();

    if (lastAction.action === 'like') {
        likedProducts.pop();
        updateLikedCount();
    }

    currentIndex = lastAction.index;
    updateStackCount();
    renderNextCard();
}

// Reset cards
function resetCards() {
    currentIndex = 0;
    history = [];
    applyFilter(activeFilter);
}

// Update counts
function updateStackCount() {
    const remaining = currentStack.length - currentIndex;
    document.getElementById('stackCount').textContent = remaining;
}

function updateLikedCount() {
    document.getElementById('likedCount').textContent = likedProducts.length;
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
