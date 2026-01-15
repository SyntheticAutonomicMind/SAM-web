// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * Prompts Management - System Prompts and Mini-Prompts
 * Handles loading and selection of prompts for conversations
 */

const Prompts = {
    systemPrompts: [],
    miniPrompts: [],
    selectedSystemPrompt: null,
    selectedMiniPrompts: [],

    /**
     * Initialize prompts system
     */
    async init() {
        await this.loadSystemPrompts();
        await this.loadMiniPrompts();
        this.setupUI();
    },

    /**
     * Load available system prompts (personalities)
     */
    async loadSystemPrompts() {
        try {
            const response = await API.request('/api/prompts/system', { method: 'GET' });
            this.systemPrompts = response.prompts || [];
            console.log('[Prompts] Loaded system prompts:', this.systemPrompts.length);
        } catch (error) {
            console.error('[Prompts] Failed to load system prompts:', error);
            Toast.error('Failed to load system prompts');
        }
    },

    /**
     * Load available mini-prompts
     */
    async loadMiniPrompts() {
        try {
            const response = await API.request('/api/mini-prompts', { method: 'GET' });
            this.miniPrompts = response.prompts || [];
            console.log('[Prompts] Loaded mini-prompts:', this.miniPrompts.length);
        } catch (error) {
            console.error('[Prompts] Failed to load mini-prompts:', error);
            Toast.error('Failed to load mini-prompts');
        }
    },

    /**
     * Set up UI for prompts
     */
    setupUI() {
        this.renderSystemPrompts();
        this.renderMiniPrompts();
        this.setupEventListeners();
        this.setupMiniPromptFilter();
    },

    /**
     * Set up mini-prompt filtering
     */
    setupMiniPromptFilter() {
        const filterInput = document.getElementById('miniPromptFilter');
        if (!filterInput) return;

        filterInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.filterMiniPrompts(query);
        });
    },

    /**
     * Filter mini-prompts based on search query
     */
    filterMiniPrompts(query) {
        const container = document.getElementById('miniPromptsList');
        if (!container) return;

        const items = container.querySelectorAll('.mini-prompt-item');
        items.forEach(item => {
            const name = item.querySelector('.mini-prompt-name')?.textContent.toLowerCase() || '';
            const desc = item.querySelector('.mini-prompt-description')?.textContent.toLowerCase() || '';
            
            if (name.includes(query) || desc.includes(query)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    },

    /**
     * Render system prompts dropdown
     */
    renderSystemPrompts() {
        const select = document.getElementById('conversationSystemPrompt');
        if (!select) return;

        // Clear and populate with API-loaded prompts only (no hardcoded placeholder)
        select.innerHTML = '';

        this.systemPrompts.forEach(prompt => {
            const option = document.createElement('option');
            option.value = prompt.id;
            option.textContent = prompt.name || prompt.id;
            select.appendChild(option);
        });

        // Set selected value if we have one
        if (this.selectedSystemPrompt) {
            select.value = this.selectedSystemPrompt;
        }
    },

    /**
     * Render mini-prompts list with checkboxes
     */
    renderMiniPrompts() {
        const container = document.getElementById('miniPromptsList');
        if (!container) return;

        if (this.miniPrompts.length === 0) {
            container.innerHTML = '<div class="loading-mini-prompts">No mini-prompts available</div>';
            return;
        }

        container.innerHTML = '';

        this.miniPrompts.forEach(prompt => {
            const item = document.createElement('label');
            item.className = 'mini-prompt-item';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = prompt.id;
            checkbox.checked = this.selectedMiniPrompts.includes(prompt.id);
            checkbox.addEventListener('change', () => this.onMiniPromptToggle(prompt.id, checkbox.checked));

            const content = document.createElement('div');
            content.className = 'mini-prompt-content';

            const name = document.createElement('div');
            name.className = 'mini-prompt-name';
            name.textContent = prompt.name || prompt.id;

            const description = document.createElement('div');
            description.className = 'mini-prompt-description';
            // Use content preview as description
            const preview = prompt.content ? prompt.content.substring(0, 60) + (prompt.content.length > 60 ? '...' : '') : '';
            description.textContent = preview;

            content.appendChild(name);
            if (preview) {
                content.appendChild(description);
            }

            item.appendChild(checkbox);
            item.appendChild(content);
            container.appendChild(item);
        });
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        const systemPromptSelect = document.getElementById('conversationSystemPrompt');
        if (systemPromptSelect) {
            systemPromptSelect.addEventListener('change', (e) => {
                this.selectedSystemPrompt = e.target.value || null;
                console.log('[Prompts] System prompt changed:', this.selectedSystemPrompt);
            });
        }

        const toggleBtn = document.getElementById('toggleSidebarBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const sidebar = document.querySelector('.prompt-sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('hidden');
                }
            });
        }
    },

    /**
     * Handle mini-prompt toggle
     */
    onMiniPromptToggle(promptId, checked) {
        if (checked) {
            if (!this.selectedMiniPrompts.includes(promptId)) {
                this.selectedMiniPrompts.push(promptId);
            }
        } else {
            this.selectedMiniPrompts = this.selectedMiniPrompts.filter(id => id !== promptId);
        }
        console.log('[Prompts] Mini-prompts selection:', this.selectedMiniPrompts);
    },

    /**
     * Get request parameters for chat API
     */
    getRequestParams() {
        const params = {};

        if (this.selectedSystemPrompt) {
            params.system_prompt_id = this.selectedSystemPrompt;
        }

        if (this.selectedMiniPrompts.length > 0) {
            params.mini_prompt_ids = this.selectedMiniPrompts;
        }

        return params;
    },

    /**
     * Load prompts from conversation
     */
    loadFromConversation(conversation) {
        if (!conversation || !conversation.settings) return;

        // Load system prompt
        if (conversation.settings.system_prompt_id) {
            this.selectedSystemPrompt = conversation.settings.system_prompt_id;
            const select = document.getElementById('conversationSystemPrompt');
            if (select) {
                select.value = this.selectedSystemPrompt;
            }
        }

        // Load mini-prompts
        if (conversation.settings.mini_prompt_ids) {
            this.selectedMiniPrompts = conversation.settings.mini_prompt_ids;
            this.renderMiniPrompts(); // Re-render to update checkboxes
        }
    },

    /**
     * Reset to defaults
     */
    reset() {
        this.selectedSystemPrompt = null;
        this.selectedMiniPrompts = [];

        const select = document.getElementById('conversationSystemPrompt');
        if (select) {
            select.value = '';
        }

        this.renderMiniPrompts();
    },

    /**
     * Alias for loadMiniPrompts - used by management UI
     */
    async fetchMiniPrompts() {
        return await this.loadMiniPrompts();
    }
};
