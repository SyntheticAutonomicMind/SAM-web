// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * Personalities Management
 * Handles loading and selection of personality configurations
 * Personalities add trait-based prompt additions AFTER the system prompt
 */

const Personalities = {
    personalities: [],
    selectedPersonality: null,

    /**
     * Initialize personalities system
     */
    async init() {
        await this.loadPersonalities();
        this.setupUI();
    },

    /**
     * Load available personalities from API
     */
    async loadPersonalities() {
        try {
            const response = await API.request('/api/personalities', { method: 'GET' });
            this.personalities = response.personalities || [];
            console.log('[Personalities] Loaded personalities:', this.personalities.length);
        } catch (error) {
            console.error('[Personalities] Failed to load personalities:', error);
            Toast.error('Failed to load personalities');
        }
    },

    /**
     * Set up UI for personalities
     */
    setupUI() {
        this.renderPersonalities();
        this.setupEventListeners();
    },

    /**
     * Render personalities dropdown grouped by category
     */
    renderPersonalities() {
        const select = document.getElementById('conversationPersonality');
        if (!select) return;

        // Clear and populate with API-loaded personalities only (no hardcoded placeholder)
        select.innerHTML = '';

        // Group personalities by category
        const byCategory = {};
        this.personalities.forEach(personality => {
            const category = personality.category || 'Custom';
            if (!byCategory[category]) {
                byCategory[category] = [];
            }
            byCategory[category].push(personality);
        });

        // Render grouped options
        const categoryOrder = ['General', 'Creative & Writing', 'Tech', 'Productivity', 'Domain Experts', 'Fun & Character', 'Custom'];
        
        categoryOrder.forEach(category => {
            if (byCategory[category] && byCategory[category].length > 0) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category;

                byCategory[category].forEach(personality => {
                    const option = document.createElement('option');
                    option.value = personality.id;
                    option.textContent = personality.name;
                    option.title = personality.description || '';
                    optgroup.appendChild(option);
                });

                select.appendChild(optgroup);
            }
        });

        // Add any remaining categories not in the order
        Object.keys(byCategory).forEach(category => {
            if (!categoryOrder.includes(category)) {
                const optgroup = document.createElement('optgroup');
                optgroup.label = category;

                byCategory[category].forEach(personality => {
                    const option = document.createElement('option');
                    option.value = personality.id;
                    option.textContent = personality.name;
                    option.title = personality.description || '';
                    optgroup.appendChild(option);
                });

                select.appendChild(optgroup);
            }
        });

        // Set selected value if we have one
        if (this.selectedPersonality) {
            select.value = this.selectedPersonality;
        }
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const personalitySelect = document.getElementById('conversationPersonality');
        if (personalitySelect) {
            personalitySelect.addEventListener('change', (e) => {
                this.selectedPersonality = e.target.value || null;
                console.log('[Personalities] Personality changed:', this.selectedPersonality);
            });
        }
    },

    /**
     * Get personality by ID
     */
    getPersonality(id) {
        return this.personalities.find(p => p.id === id);
    },

    /**
     * Reset selection
     */
    reset() {
        this.selectedPersonality = null;
        const select = document.getElementById('conversationPersonality');
        if (select) {
            select.value = '';
        }
    },

    /**
     * Load personality from conversation metadata
     */
    loadFromConversation(conversation) {
        // Check if conversation has personality setting
        if (conversation.settings && conversation.settings.personalityId) {
            this.selectedPersonality = conversation.settings.personalityId;
            const select = document.getElementById('conversationPersonality');
            if (select) {
                select.value = this.selectedPersonality;
            }
        } else {
            this.reset();
        }
    },

    /**
     * Get request parameters to include in chat API calls
     */
    getRequestParams() {
        const params = {};
        
        if (this.selectedPersonality) {
            params.personality_id = this.selectedPersonality;
        }

        return params;
    }
};
