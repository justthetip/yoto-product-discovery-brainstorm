/**
 * AI-Powered Product Discovery Chat Interface
 * Optimized for Vercel Edge Functions and minimal API costs
 */

// Comprehensive logging utility
const Logger = {
    colors: {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        debug: '#9C27B0'
    },

    log(level, message, data = null) {
        const timestamp = new Date().toISOString();
        const color = this.colors[level] || '#000';

        console.group(`%c[${level.toUpperCase()}] ${timestamp}`, `color: ${color}; font-weight: bold`);
        console.log(message);
        if (data) {
            console.log('Data:', data);
        }
        console.trace('Stack trace:');
        console.groupEnd();
    },

    info(message, data) { this.log('info', message, data); },
    success(message, data) { this.log('success', message, data); },
    warning(message, data) { this.log('warning', message, data); },
    error(message, data) { this.log('error', message, data); },
    debug(message, data) { this.log('debug', message, data); }
};

class YotoAIChat {
    constructor() {
        this.products = [];
        this.conversationHistory = [];
        this.currentResults = [];
        this.isLoading = false;

        // Cache for responses (reduce API costs)
        this.responseCache = new Map();

        Logger.info('YotoAIChat initialized');
        this.init();
    }

    async init() {
        await this.loadProducts();
        this.setupEventListeners();
        this.loadConversationHistory();
    }

    async loadProducts() {
        try {
            Logger.info('Loading product catalogue...');
            const response = await fetch('../data/yoto-content.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            this.products = data.data.products;
            Logger.success(`Loaded ${this.products.length} products`, {
                totalProducts: this.products.length,
                sampleProduct: this.products[0]
            });
        } catch (error) {
            Logger.error('Error loading products', { error: error.message, stack: error.stack });
            this.showError('Failed to load product catalogue. Please refresh the page.');
        }
    }

    setupEventListeners() {
        Logger.info('Setting up event listeners...');

        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const quickPrompts = document.querySelectorAll('.quick-prompt');

        Logger.debug('DOM elements found', {
            chatInput: !!chatInput,
            sendButton: !!sendButton,
            quickPromptsCount: quickPrompts.length
        });

        if (!chatInput) {
            Logger.error('chatInput element not found!');
            return;
        }

        if (!sendButton) {
            Logger.error('sendButton element not found!');
            return;
        }

        // Send message on button click
        sendButton.addEventListener('click', () => {
            Logger.info('🔘 Send button CLICKED!', {
                inputValue: chatInput.value,
                isLoading: this.isLoading
            });
            this.sendMessage();
        });
        Logger.success('Send button click listener attached');

        // Send message on Enter key
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                Logger.info('⌨️ Enter key pressed in chat input', {
                    inputValue: chatInput.value,
                    isLoading: this.isLoading
                });
                e.preventDefault();
                this.sendMessage();
            }
        });
        Logger.success('Enter key listener attached');

        // Quick prompt buttons
        quickPrompts.forEach((button, index) => {
            button.addEventListener('click', () => {
                const prompt = button.dataset.prompt;
                Logger.info(`Quick prompt #${index} clicked`, { prompt });
                chatInput.value = prompt;
                this.sendMessage();
            });
        });
        Logger.success(`${quickPrompts.length} quick prompt listeners attached`);

        // Debug panel toggle
        const debugHeader = document.getElementById('debugHeader');
        const debugContent = document.getElementById('debugContent');
        const debugToggle = debugHeader?.querySelector('.debug-toggle');

        if (debugHeader && debugContent) {
            debugHeader.addEventListener('click', () => {
                const isOpen = debugContent.classList.toggle('open');
                if (debugToggle) {
                    debugToggle.textContent = isOpen ? '▲ Click to collapse' : '▼ Click to expand';
                }
            });
            Logger.success('Debug panel toggle listener attached');
        }
    }

    async sendMessage() {
        Logger.info('🚀 sendMessage() method CALLED');

        const chatInput = document.getElementById('chatInput');
        if (!chatInput) {
            Logger.error('chatInput element not found in sendMessage()!');
            return;
        }

        const message = chatInput.value.trim();

        Logger.debug('sendMessage() validation check', {
            rawValue: chatInput.value,
            trimmedMessage: message,
            messageLength: message.length,
            isEmpty: !message,
            isLoading: this.isLoading,
            willProceed: !(!message || this.isLoading)
        });

        if (!message || this.isLoading) {
            Logger.warning('❌ Cannot send message - validation failed', {
                message,
                isLoading: this.isLoading,
                reason: !message ? 'Empty message' : 'Already loading'
            });
            return;
        }

        Logger.info('✅ Sending user message', { message, conversationLength: this.conversationHistory.length });

        // Add user message to UI
        this.addMessageToUI('user', message);

        // Clear input
        chatInput.value = '';

        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message
        });

        // Show loading indicator
        this.isLoading = true;
        this.showLoading();

        const startTime = performance.now();

        try {
            // Check cache first
            const cacheKey = this.getCacheKey(message);
            if (this.responseCache.has(cacheKey)) {
                Logger.info('Using cached response', { cacheKey });
                const cachedResponse = this.responseCache.get(cacheKey);
                this.handleAIResponse(cachedResponse);
                return;
            }

            // Pre-filter products on client side to reduce token usage
            const filterStartTime = performance.now();
            const preFilteredProducts = this.preFilterProducts(this.conversationHistory);
            const filterTime = performance.now() - filterStartTime;

            Logger.success(`Pre-filtered products in ${filterTime.toFixed(2)}ms`, {
                totalProducts: this.products.length,
                filteredProducts: preFilteredProducts.length,
                filterTime: `${filterTime.toFixed(2)}ms`,
                sampleProducts: preFilteredProducts.slice(0, 3).map(p => ({ title: p.title, price: p.price }))
            });

            // Call AI API
            const apiStartTime = performance.now();
            const response = await this.callAI(this.conversationHistory, preFilteredProducts);
            const apiTime = performance.now() - apiStartTime;

            Logger.success(`AI response received in ${apiTime.toFixed(2)}ms`, {
                apiTime: `${apiTime.toFixed(2)}ms`,
                responsePreview: {
                    message: response.message?.substring(0, 100),
                    productsCount: response.products?.length
                }
            });

            // Cache the response
            this.responseCache.set(cacheKey, response);

            // Handle response
            this.handleAIResponse(response);

            // Save conversation history
            this.saveConversationHistory();

            const totalTime = performance.now() - startTime;
            Logger.success(`Message processing complete in ${totalTime.toFixed(2)}ms`, {
                totalTime: `${totalTime.toFixed(2)}ms`,
                breakdown: {
                    filtering: `${filterTime.toFixed(2)}ms`,
                    apiCall: `${apiTime.toFixed(2)}ms`,
                    other: `${(totalTime - filterTime - apiTime).toFixed(2)}ms`
                }
            });

        } catch (error) {
            Logger.error('Error sending message', {
                error: error.message,
                stack: error.stack,
                message: message,
                conversationHistory: this.conversationHistory
            });
            this.showError(`Failed to get AI response: ${error.message}`);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    getCacheKey(message) {
        // Simple cache key based on message content
        return message.toLowerCase().trim();
    }

    expandKeywordsSemantically(keywords) {
        // Semantic mappings for keyword expansion
        const semanticMap = {
            'dinosaur': ['prehistoric', 'reptile', 'jurassic', 'fossil', 'tyrannosaurus', 't-rex', 'triceratops'],
            'space': ['astronomy', 'planet', 'rocket', 'astronaut', 'galaxy', 'star', 'moon', 'solar'],
            'princess': ['fairy tale', 'royal', 'castle', 'crown', 'queen'],
            'pirate': ['treasure', 'ship', 'sea', 'adventure', 'ocean'],
            'animal': ['creature', 'wildlife', 'nature', 'jungle', 'safari'],
            'music': ['song', 'melody', 'rhythm', 'instrument', 'singing'],
            'story': ['tale', 'narrative', 'adventure', 'journey'],
            'science': ['experiment', 'discovery', 'learning', 'stem'],
            'magic': ['wizard', 'spell', 'fantasy', 'enchanted', 'mystical']
        };

        const expanded = [...keywords];
        keywords.forEach(keyword => {
            // Check if this keyword has semantic expansions
            for (const [baseWord, expansions] of Object.entries(semanticMap)) {
                if (keyword.includes(baseWord) || baseWord.includes(keyword)) {
                    expanded.push(...expansions);
                }
            }
        });

        // Remove duplicates
        return [...new Set(expanded)];
    }

    expandContentTypes(contentTypes) {
        // More flexible content type matching for expansion
        const typeExpansions = {
            'Stories': ['Adventures', 'Tales', 'Narratives', 'Learning & Education'],
            'Music': ['Songs', 'Lullabies', 'Rhymes'],
            'Learning & Education': ['Stories', 'Science', 'Discovery']
        };

        const expanded = [...contentTypes];
        contentTypes.forEach(type => {
            if (typeExpansions[type]) {
                expanded.push(...typeExpansions[type]);
            }
        });

        return [...new Set(expanded)];
    }

    preFilterProducts(conversationHistory) {
        // Combine all user messages from conversation history to maintain context
        const allUserMessages = conversationHistory
            .filter(msg => msg.role === 'user')
            .map(msg => msg.content)
            .join(' ');

        const queryLower = allUserMessages.toLowerCase();

        Logger.debug('Pre-filtering with full conversation context', {
            messagesCount: conversationHistory.length,
            userMessagesCount: conversationHistory.filter(msg => msg.role === 'user').length,
            combinedQuery: allUserMessages.substring(0, 200),
            queryLength: allUserMessages.length
        });

        // Extract potential filters from the combined conversation
        const filters = {
            maxPrice: this.extractMaxPrice(queryLower),
            ageRange: this.extractAgeRange(queryLower),
            maxRuntime: this.extractMaxRuntime(queryLower),
            contentTypes: this.extractContentTypes(queryLower),
            keywords: this.extractKeywords(queryLower)
        };

        Logger.info('🔍 Filter extraction', {
            keywords: filters.keywords,
            contentTypes: filters.contentTypes,
            ageRange: filters.ageRange ? `[${filters.ageRange[0]}, ${filters.ageRange[1]}]` : null,
            maxPrice: filters.maxPrice ? `£${filters.maxPrice}` : null,
            maxRuntime: filters.maxRuntime ? `${Math.floor(filters.maxRuntime / 60)}min` : null
        });

        // Check if we have ANY filters - if not, return all available products
        const hasFilters = filters.maxPrice || filters.ageRange || filters.maxRuntime ||
                          filters.contentTypes.length > 0 || filters.keywords.length > 0;

        // Filter products
        let filtered = this.products.filter(product => {
            // Availability check (always prefer available)
            if (product.availableForSale === false) return false;

            // If no filters, include all available products
            if (!hasFilters) return true;

            // Price filter (hard constraint - must pass or exclude)
            if (filters.maxPrice) {
                if (parseFloat(product.price) > filters.maxPrice) {
                    return false; // Hard constraint - exclude if over budget
                }
            }

            // Runtime filter (hard constraint - must pass or exclude)
            if (filters.maxRuntime) {
                if (product.runtime > filters.maxRuntime) {
                    return false; // Hard constraint - exclude if too long
                }
            }

            // Strict AND logic: ALL specified filters must match
            const filterChecks = [];

            // Age filter - must match if specified
            if (filters.ageRange) {
                if (product.ageRange) {
                    const [minAge, maxAge] = product.ageRange;
                    // Check for overlap
                    const ageMatches = minAge <= filters.ageRange[1] && maxAge >= filters.ageRange[0];
                    filterChecks.push(ageMatches);
                } else {
                    // No age range data on product - fail this filter
                    filterChecks.push(false);
                }
            }

            // Content type filter - must match if specified
            if (filters.contentTypes.length > 0) {
                if (product.contentType) {
                    const hasMatchingType = filters.contentTypes.some(type =>
                        product.contentType.some(ct => ct.toLowerCase().includes(type.toLowerCase()))
                    );
                    filterChecks.push(hasMatchingType);
                } else {
                    // No content type data - fail this filter
                    filterChecks.push(false);
                }
            }

            // Keyword matching - must match if specified
            if (filters.keywords.length > 0) {
                const searchText = `${product.title} ${product.author} ${product.blurb || ''} ${product.contentType?.join(' ')}`.toLowerCase();
                const hasKeyword = filters.keywords.some(keyword => {
                    // Try exact match first
                    if (searchText.includes(keyword)) return true;

                    // Handle plurals ending in 's'
                    if (keyword.endsWith('s')) {
                        // Try removing just 's' (princesses -> princesse)
                        if (searchText.includes(keyword.slice(0, -1))) return true;
                        // Try removing 'es' (princesses -> princess, boxes -> box)
                        if (keyword.endsWith('es') && searchText.includes(keyword.slice(0, -2))) return true;
                    }

                    // Try adding 's' or 'es'
                    if (searchText.includes(keyword + 's')) return true;
                    if (searchText.includes(keyword + 'es')) return true;

                    // Handle ies/y transformations (stories/story)
                    if (keyword.endsWith('ies') && searchText.includes(keyword.slice(0, -3) + 'y')) return true;
                    if (searchText.includes(keyword.replace(/y$/, 'ies'))) return true;

                    return false;
                });
                filterChecks.push(hasKeyword);
            }

            // Product must pass ALL filter checks
            // If no soft filters specified, include all products (that passed hard constraints)
            return filterChecks.length === 0 || filterChecks.every(check => check === true);
        });

        // Sort by relevance (basic scoring)
        filtered = this.scoreAndSortProducts(filtered, filters);

        Logger.info('📊 Initial filter results', {
            totalProducts: this.products.length,
            availableProducts: this.products.filter(p => p.availableForSale !== false).length,
            afterFiltering: filtered.length,
            expansionWillTrigger: filtered.length < 3 && (filters.keywords.length > 0 || filters.contentTypes.length > 0)
        });

        // Log example matched products for debugging
        const exampleMatches = filtered.length > 0 ? filtered.slice(0, 3).map(p => ({
            title: p.title,
            age: p.ageRange ? `[${p.ageRange[0]}, ${p.ageRange[1]}]` : 'N/A',
            contentType: p.contentType,
            hasKeywordInTitle: filters.keywords.some(k => p.title?.toLowerCase().includes(k)),
            hasKeywordInBlurb: filters.keywords.some(k => p.blurb?.toLowerCase().includes(k)),
            price: `£${p.price}`
        })) : [];

        if (filtered.length > 0) {
            Logger.debug('Example matches (first 3)', {
                products: exampleMatches
            });
        }

        // Update UI debug panel
        this.updateDebugPanel(
            filters,
            {
                totalProducts: this.products.length,
                availableProducts: this.products.filter(p => p.availableForSale !== false).length,
                afterFiltering: filtered.length,
                expansionWillTrigger: filtered.length < 3 && (filters.keywords.length > 0 || filters.contentTypes.length > 0)
            },
            exampleMatches
        );

        // Check if we need to expand the search semantically
        if (filtered.length < 3 && (filters.keywords.length > 0 || filters.contentTypes.length > 0)) {
            Logger.info('🔍 Few results found, expanding search semantically', {
                originalCount: filtered.length,
                threshold: 3,
                willExpandKeywords: filters.keywords.length > 0,
                willExpandContentTypes: filters.contentTypes.length > 0
            });

            // Expand keywords and content types semantically
            const expandedFilters = {
                ...filters,
                keywords: filters.keywords.length > 0 ? this.expandKeywordsSemantically(filters.keywords) : filters.keywords,
                contentTypes: filters.contentTypes.length > 0 ? this.expandContentTypes(filters.contentTypes) : filters.contentTypes
            };

            Logger.debug('Expanded filters', {
                originalKeywords: filters.keywords,
                expandedKeywords: expandedFilters.keywords,
                originalContentTypes: filters.contentTypes,
                expandedContentTypes: expandedFilters.contentTypes,
                keywordsExpanded: expandedFilters.keywords.length - filters.keywords.length,
                contentTypesExpanded: expandedFilters.contentTypes.length - filters.contentTypes.length
            });

            // Get IDs of products we already have
            const existingIds = new Set(filtered.map(p => p.id));

            // Run second pass with expanded filters (keep age strict)
            const expandedResults = this.products.filter(product => {
                // Skip products we already have
                if (existingIds.has(product.id)) return false;

                // Apply hard constraints (price, availability)
                if (!product.availableForSale) return false;
                if (filters.maxPrice && product.price && parseFloat(product.price) > filters.maxPrice) {
                    return false;
                }

                const filterChecks = [];

                // Age filter - KEEP STRICT (must match if specified)
                if (filters.ageRange) {
                    if (product.ageRange) {
                        const [minAge, maxAge] = product.ageRange;
                        const ageMatches = minAge <= filters.ageRange[1] && maxAge >= filters.ageRange[0];
                        filterChecks.push(ageMatches);
                    } else {
                        filterChecks.push(false);
                    }
                }

                // Content type filter - use EXPANDED types
                if (expandedFilters.contentTypes.length > 0) {
                    if (product.contentType) {
                        const hasMatchingType = expandedFilters.contentTypes.some(type =>
                            product.contentType.some(ct => ct.toLowerCase().includes(type.toLowerCase()))
                        );
                        filterChecks.push(hasMatchingType);
                    } else {
                        filterChecks.push(false);
                    }
                }

                // Keyword matching - use EXPANDED keywords
                if (expandedFilters.keywords.length > 0) {
                    const searchText = `${product.title} ${product.author} ${product.blurb || ''} ${product.contentType?.join(' ')}`.toLowerCase();
                    const hasKeyword = expandedFilters.keywords.some(keyword => {
                        // Try exact match first
                        if (searchText.includes(keyword)) return true;

                        // Handle plurals
                        if (keyword.endsWith('s')) {
                            if (searchText.includes(keyword.slice(0, -1))) return true;
                            if (keyword.endsWith('es') && searchText.includes(keyword.slice(0, -2))) return true;
                        }

                        // Try adding 's' or 'es'
                        if (searchText.includes(keyword + 's')) return true;
                        if (searchText.includes(keyword + 'es')) return true;

                        // Handle ies/y transformations
                        if (keyword.endsWith('ies') && searchText.includes(keyword.slice(0, -3) + 'y')) return true;
                        if (searchText.includes(keyword.replace(/y$/, 'ies'))) return true;

                        return false;
                    });
                    filterChecks.push(hasKeyword);
                }

                // Product must pass ALL filter checks
                return filterChecks.length === 0 || filterChecks.every(check => check === true);
            });

            // Tag expanded results
            expandedResults.forEach(product => {
                product.isExpanded = true;
            });

            // Score and sort expanded results
            const scoredExpandedResults = this.scoreAndSortProducts(expandedResults, expandedFilters);

            Logger.success('✨ Semantic expansion completed', {
                originalCount: filtered.length,
                expandedCount: scoredExpandedResults.length,
                totalCount: filtered.length + scoredExpandedResults.length,
                expandedProductIds: scoredExpandedResults.slice(0, 5).map(p => p.id)
            });

            // Combine original (higher priority) + expanded results
            filtered = [...filtered, ...scoredExpandedResults];
        }

        // Limit to top 100 to reduce token usage
        return filtered.slice(0, 100);
    }

    extractMaxPrice(query) {
        // Look for price mentions like "under £10", "less than 15", etc.
        const patterns = [
            /under\s*£?(\d+)/i,
            /less\s*than\s*£?(\d+)/i,
            /cheaper\s*than\s*£?(\d+)/i,
            /below\s*£?(\d+)/i,
            /max\s*£?(\d+)/i,
            /maximum\s*£?(\d+)/i,
        ];

        for (const pattern of patterns) {
            const match = query.match(pattern);
            if (match) return parseFloat(match[1]);
        }

        return null;
    }

    extractAgeRange(query) {
        // Look for age mentions
        const patterns = [
            /(\d+)[\s-]year[\s-]old/i,
            /age\s*(\d+)/i,
            /for\s*(\d+)/i,
        ];

        for (const pattern of patterns) {
            const match = query.match(pattern);
            if (match) {
                const age = parseInt(match[1]);
                const range = [Math.max(0, age - 1), age + 1];

                Logger.info('🎯 Age extraction', {
                    query: query.substring(0, 100),
                    pattern: pattern.source,
                    extractedAge: age,
                    filterRange: range,
                    logic: 'age ± 1 for flexibility'
                });

                // Return a range around the mentioned age
                return range;
            }
        }

        // Look for age group keywords
        if (query.includes('toddler')) {
            Logger.info('🎯 Age extraction', {
                query: query.substring(0, 100),
                keyword: 'toddler',
                filterRange: [2, 4]
            });
            return [2, 4];
        }
        if (query.includes('preschool')) {
            Logger.info('🎯 Age extraction', {
                query: query.substring(0, 100),
                keyword: 'preschool',
                filterRange: [3, 5]
            });
            return [3, 5];
        }
        if (query.includes('baby') || query.includes('babies')) {
            Logger.info('🎯 Age extraction', {
                query: query.substring(0, 100),
                keyword: 'baby/babies',
                filterRange: [0, 2]
            });
            return [0, 2];
        }

        return null;
    }

    extractMaxRuntime(query) {
        // Look for duration mentions
        const patterns = [
            /under\s*(\d+)\s*min/i,
            /less\s*than\s*(\d+)\s*min/i,
            /shorter\s*than\s*(\d+)\s*min/i,
            /(\d+)\s*min\s*or\s*less/i,
        ];

        for (const pattern of patterns) {
            const match = query.match(pattern);
            if (match) return parseInt(match[1]) * 60; // Convert to seconds
        }

        // Look for hour mentions
        const hourPattern = /under\s*(\d+)\s*hour/i;
        const hourMatch = query.match(hourPattern);
        if (hourMatch) return parseInt(hourMatch[1]) * 3600;

        // Quick/short keywords
        if (query.includes('quick') || query.includes('short')) return 30 * 60; // 30 minutes

        return null;
    }

    extractContentTypes(query) {
        const types = [];

        // Common content types
        const typeMap = {
            'story': 'Stories',
            'stories': 'Stories',
            'music': 'Music',
            'song': 'Music',
            'songs': 'Music',
            'education': 'Learning & Education',
            'educational': 'Learning & Education',
            'learning': 'Learning & Education',
            'adventure': 'Action & Adventure',
            'bedtime': 'Stories',
            'sleep': 'Stories',
            'lullaby': 'Music',
        };

        for (const [keyword, type] of Object.entries(typeMap)) {
            if (query.includes(keyword) && !types.includes(type)) {
                types.push(type);
            }
        }

        return types;
    }

    extractKeywords(query) {
        // Extract meaningful keywords (remove common words)
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'find', 'show', 'get', 'give', 'me', 'my', 'i', 'you', 'your', 'under', 'over', 'less', 'more', 'than', 'about'];

        const words = query.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        // Remove duplicates - important when combining multiple conversation messages
        return [...new Set(words)];
    }

    scoreAndSortProducts(products, filters) {
        // Helper function for fuzzy keyword matching
        const matchesKeyword = (text, keyword) => {
            // Try exact match first
            if (text.includes(keyword)) return true;

            // Handle plurals ending in 's'
            if (keyword.endsWith('s')) {
                // Try removing just 's' (princesses -> princesse)
                if (text.includes(keyword.slice(0, -1))) return true;
                // Try removing 'es' (princesses -> princess, boxes -> box)
                if (keyword.endsWith('es') && text.includes(keyword.slice(0, -2))) return true;
            }

            // Try adding 's' or 'es'
            if (text.includes(keyword + 's')) return true;
            if (text.includes(keyword + 'es')) return true;

            // Handle ies/y transformations (stories/story)
            if (keyword.endsWith('ies') && text.includes(keyword.slice(0, -3) + 'y')) return true;
            if (text.includes(keyword.replace(/y$/, 'ies'))) return true;

            return false;
        };

        return products.map(product => {
            let score = 0;

            // Boost if keywords match title
            if (filters.keywords.length > 0) {
                const titleLower = product.title.toLowerCase();
                filters.keywords.forEach(keyword => {
                    if (matchesKeyword(titleLower, keyword)) score += 3;
                });
            }

            // Boost if keywords match blurb
            if (product.blurb && filters.keywords.length > 0) {
                const blurbLower = product.blurb.toLowerCase();
                filters.keywords.forEach(keyword => {
                    if (matchesKeyword(blurbLower, keyword)) score += 1;
                });
            }

            // Boost new products
            if (product.flag === 'New to Yoto') score += 2;

            // Boost if within perfect age range
            if (filters.ageRange && product.ageRange) {
                const [targetMin, targetMax] = filters.ageRange;
                const [prodMin, prodMax] = product.ageRange;
                if (prodMin >= targetMin && prodMax <= targetMax) score += 5;
            }

            return { product, score };
        })
        .sort((a, b) => b.score - a.score)
        .map(item => item.product);
    }

    async callAI(messages, products) {
        // Use local API endpoint (works for both local dev and Vercel)
        const apiUrl = '/api/chat';

        const requestPayload = {
            messages: messages,
            products: products,
            provider: 'anthropic'
        };

        Logger.info('Calling AI API', {
            url: apiUrl,
            messageCount: messages.length,
            productCount: products.length,
            provider: 'anthropic',
            payloadSize: `${(JSON.stringify(requestPayload).length / 1024).toFixed(2)} KB`
        });

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });

            Logger.info('API response received', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { raw: errorText };
                }

                Logger.error('API request failed', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData,
                    requestPayload: {
                        messageCount: messages.length,
                        productCount: products.length
                    }
                });

                throw new Error(errorData.error || errorData.details || errorText || 'API request failed');
            }

            const responseData = await response.json();

            Logger.success('AI API call successful', {
                hasMessage: !!responseData.message,
                messagePreview: responseData.message?.substring(0, 100),
                productCount: responseData.products?.length,
                hasSuggestions: !!responseData.suggestions
            });

            return responseData;

        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                Logger.error('Network error calling AI API', {
                    error: error.message,
                    stack: error.stack,
                    apiUrl,
                    possibleCauses: [
                        'Network connection issue',
                        'API endpoint not deployed',
                        'CORS configuration issue'
                    ]
                });
            } else {
                Logger.error('Unexpected error calling AI API', {
                    error: error.message,
                    stack: error.stack,
                    type: error.name
                });
            }
            throw error;
        }
    }

    handleAIResponse(response) {
        // Add AI message to conversation history
        this.conversationHistory.push({
            role: 'assistant',
            content: response.message
        });

        // Add AI message to UI
        this.addMessageToUI('assistant', response.message);

        // Display products if any
        if (response.products && response.products.length > 0) {
            this.displayProducts(response.products);
        } else if (!response.needsMoreInfo) {
            // No products found
            document.getElementById('productResults').innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🤷</div>
                    <h3>No matching products</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
        }
    }

    addMessageToUI(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;

        const avatar = role === 'user' ? '👤' : '🤖';

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">${this.formatMessageContent(content)}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessageContent(content) {
        // Convert markdown-style formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }

    showLoading() {
        const messagesContainer = document.getElementById('chatMessages');
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message assistant loading-message';
        loadingDiv.id = 'loadingMessage';

        loadingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="loading">
                <span>Thinking</span>
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideLoading() {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    displayProducts(rankedProducts) {
        Logger.info('🎨 displayProducts() called', {
            rankedProductsCount: rankedProducts.length,
            products: rankedProducts.map(p => ({ id: p.id, score: p.relevanceScore }))
        });

        const resultsContainer = document.getElementById('productResults');
        const resultsCount = document.getElementById('resultsCount');

        Logger.debug('Display containers', {
            hasResultsContainer: !!resultsContainer,
            hasResultsCount: !!resultsCount
        });

        if (resultsCount) {
            resultsCount.textContent = `${rankedProducts.length} product${rankedProducts.length !== 1 ? 's' : ''} found`;
        }

        // Get full product details
        const productsWithDetails = rankedProducts.map(rp => {
            const product = this.products.find(p => p.id === rp.id);
            return {
                ...product,
                relevanceScore: rp.relevanceScore,
                reasoning: rp.reasoning
            };
        }).filter(p => p.id); // Filter out any not found

        Logger.debug('Products with details', {
            count: productsWithDetails.length,
            titles: productsWithDetails.map(p => p.title)
        });

        // Sort by relevance score
        productsWithDetails.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

        if (resultsContainer) {
            resultsContainer.innerHTML = productsWithDetails.map(product => this.createProductCard(product)).join('');
            Logger.success('Products rendered to resultsContainer');
        } else {
            Logger.warning('resultsContainer not found - products not rendered to default container');
        }

        this.currentResults = productsWithDetails;
        Logger.success('displayProducts() complete', { currentResultsCount: this.currentResults.length });
    }

    updateDebugPanel(filters, filterResults, exampleMatches) {
        const debugPanel = document.getElementById('debugPanel');
        const debugFilters = document.getElementById('debugFilters');
        const debugResults = document.getElementById('debugResults');
        const debugExamples = document.getElementById('debugExamples');

        if (!debugPanel || !debugFilters || !debugResults || !debugExamples) {
            return;
        }

        // Show the debug panel
        debugPanel.style.display = 'block';

        // Update filters section
        debugFilters.innerHTML = `
            <div class="debug-info-row">
                <span class="debug-label">Keywords:</span>
                <span class="debug-value">${filters.keywords.length > 0 ? filters.keywords.map(k => `<span class="debug-badge">${k}</span>`).join('') : 'None'}</span>
            </div>
            <div class="debug-info-row">
                <span class="debug-label">Content Types:</span>
                <span class="debug-value">${filters.contentTypes.length > 0 ? filters.contentTypes.map(t => `<span class="debug-badge">${t}</span>`).join('') : 'None'}</span>
            </div>
            <div class="debug-info-row">
                <span class="debug-label">Age Range:</span>
                <span class="debug-value">${filters.ageRange ? `[${filters.ageRange[0]}, ${filters.ageRange[1]}]` : 'Not specified'}</span>
            </div>
            <div class="debug-info-row">
                <span class="debug-label">Max Price:</span>
                <span class="debug-value">${filters.maxPrice ? `£${filters.maxPrice}` : 'Not specified'}</span>
            </div>
            <div class="debug-info-row">
                <span class="debug-label">Max Runtime:</span>
                <span class="debug-value">${filters.maxRuntime ? `${Math.floor(filters.maxRuntime / 60)}min` : 'Not specified'}</span>
            </div>
        `;

        // Update results section
        debugResults.innerHTML = `
            <div class="debug-info-row">
                <span class="debug-label">Total Products:</span>
                <span class="debug-value">${filterResults.totalProducts}</span>
            </div>
            <div class="debug-info-row">
                <span class="debug-label">Available Products:</span>
                <span class="debug-value">${filterResults.availableProducts}</span>
            </div>
            <div class="debug-info-row">
                <span class="debug-label">After Filtering:</span>
                <span class="debug-value">${filterResults.afterFiltering}</span>
            </div>
            <div class="debug-info-row">
                <span class="debug-label">Expansion Triggered:</span>
                <span class="debug-value">${filterResults.expansionWillTrigger ? 'Yes' : 'No'}</span>
            </div>
        `;

        // Update examples section
        if (exampleMatches && exampleMatches.length > 0) {
            debugExamples.innerHTML = exampleMatches.map(p => `
                <div class="debug-example">
                    <div class="debug-example-title">${p.title}</div>
                    <div class="debug-example-meta">
                        Age: ${p.age} |
                        Price: ${p.price} |
                        Types: ${Array.isArray(p.contentType) ? p.contentType.join(', ') : p.contentType}
                    </div>
                    <div class="debug-example-meta">
                        Keyword in title: ${p.hasKeywordInTitle ? '✅' : '❌'} |
                        Keyword in blurb: ${p.hasKeywordInBlurb ? '✅' : '❌'}
                    </div>
                </div>
            `).join('');
        } else {
            debugExamples.innerHTML = '<div class="debug-info-row"><span class="debug-label">No matches to display</span></div>';
        }
    }

    createProductCard(product) {
        const imageUrl = product.images?.[0]?.url || product.imgSet?.sm?.src || '';
        const runtime = product.runtime ? this.formatRuntime(product.runtime) : null;
        const ageRange = product.ageRange ? `Ages ${product.ageRange[0]}-${product.ageRange[1]}` : null;

        return `
            <div class="product-card" onclick="window.yotoChat.showProductDetails('${product.id}')">
                <div class="product-header">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${product.title}" class="product-image">` : ''}
                    <div class="product-info">
                        <div class="product-title">${product.title}</div>
                        ${product.author ? `<div class="product-author">by ${product.author}</div>` : ''}
                        <div class="product-meta">
                            <span class="meta-tag price">£${product.price}</span>
                            ${ageRange ? `<span class="meta-tag">${ageRange}</span>` : ''}
                            ${runtime ? `<span class="meta-tag">${runtime}</span>` : ''}
                            ${product.relevanceScore ? `<span class="relevance-score">${product.relevanceScore}% match</span>` : ''}
                        </div>
                    </div>
                </div>
                ${product.reasoning ? `<div class="product-reasoning">💡 ${product.reasoning}</div>` : ''}
                ${product.blurb ? `<div class="product-blurb">${product.blurb.substring(0, 150)}${product.blurb.length > 150 ? '...' : ''}</div>` : ''}
            </div>
        `;
    }

    formatRuntime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else {
            return `${minutes}m`;
        }
    }

    showProductDetails(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // For now, just log to console. Could implement a modal later.
        console.log('Product details:', product);
        alert(`Product: ${product.title}\n\nPrice: £${product.price}\n\n${product.blurb || 'No description available'}`);
    }

    showError(message) {
        const messagesContainer = document.getElementById('chatMessages');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        messagesContainer.appendChild(errorDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('yoto_conversation', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('yoto_conversation');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
                // Optionally reload messages to UI
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }
}

// Initialize the chat when DOM is ready
let yotoChat;
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        yotoChat = new YotoAIChat();
        window.yotoChat = yotoChat; // Make available globally
    });
} else {
    yotoChat = new YotoAIChat();
    window.yotoChat = yotoChat;
}
