// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * SAM-Web Parameters Manager
 * Manages all toolbar settings: model, prompts, personality, and advanced parameters
 * All settings are conversation-scoped and persisted with the conversation
 */

const Parameters = {
    // ============================================
    // STATE - All conversation-scoped
    // ============================================
    
    // Model selection
    currentModel: '',
    
    // Conversation ID (for API requests)
    conversationId: null,
    
    // Advanced parameters (collapsible section)
    showAdvancedParameters: false,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: null,  // null = disabled, number = enabled (1.0-2.0)
    enableReasoning: false,
    enableTools: true,
    
    // ============================================
    // INITIALIZATION
    // ============================================
    
    /**
     * Initialize parameters system
     * Load defaults from localStorage
     */
    async init() {
        // Load toolbar visibility
        const savedShow = localStorage.getItem('sam-web-showAdvancedParameters');
        this.showAdvancedParameters = savedShow === 'true';
        
        // Load default parameters (used for new conversations)
        this.temperature = parseFloat(localStorage.getItem('sam-web-temperature') || '0.7');
        this.topP = parseFloat(localStorage.getItem('sam-web-topP') || '0.9');
        
        const savedRepPenalty = localStorage.getItem('sam-web-repetitionPenalty');
        this.repetitionPenalty = savedRepPenalty ? parseFloat(savedRepPenalty) : null;
        
        this.enableReasoning = localStorage.getItem('sam-web-enableReasoning') === 'true';
        this.enableTools = localStorage.getItem('sam-web-enableTools') !== 'false'; // default true
        
        console.log('[Parameters] Initialized with defaults:', {
            showAdvancedParameters: this.showAdvancedParameters,
            temperature: this.temperature,
            topP: this.topP,
            repetitionPenalty: this.repetitionPenalty,
            enableReasoning: this.enableReasoning,
            enableTools: this.enableTools
        });
    },
    
    /**
     * Load parameters from a conversation
     * Called when switching conversations or loading existing conversation
     */
    loadFromConversation(conversation) {
        if (!conversation) {
            console.log('[Parameters] No conversation to load from, using defaults');
            return;
        }
        
        console.log('[Parameters] Loading from conversation:', conversation.id);
        
        // Set conversation ID
        this.conversationId = conversation.id;
        
        // Load settings from conversation
        const settings = conversation.settings || {};
        
        // Model (from conversation metadata, not settings)
        if (conversation.model) {
            this.currentModel = conversation.model;
        }
        
        // Advanced parameters visibility
        if (settings.showAdvancedParameters !== undefined) {
            this.showAdvancedParameters = settings.showAdvancedParameters;
        }
        
        // Parameter values
        if (settings.temperature !== undefined) {
            this.temperature = settings.temperature;
        }
        if (settings.topP !== undefined) {
            this.topP = settings.topP;
        }
        if (settings.repetitionPenalty !== undefined) {
            this.repetitionPenalty = settings.repetitionPenalty;
        }
        if (settings.enableReasoning !== undefined) {
            this.enableReasoning = settings.enableReasoning;
        }
        if (settings.enableTools !== undefined) {
            this.enableTools = settings.enableTools;
        }
        
        // Update UI to reflect loaded state
        this.updateUI();
        
        console.log('[Parameters] Loaded state:', {
            conversationId: this.conversationId,
            model: this.currentModel,
            temperature: this.temperature,
            topP: this.topP,
            repetitionPenalty: this.repetitionPenalty,
            enableReasoning: this.enableReasoning,
            enableTools: this.enableTools
        });
    },
    
    /**
     * Reset to defaults for new conversation
     */
    resetForNewConversation() {
        console.log('[Parameters] Resetting for new conversation');
        
        // Generate new conversation ID
        this.conversationId = crypto.randomUUID();
        
        // Keep current toolbar visibility and parameter values
        // (user preferences persist across conversations)
        
        // Update UI
        this.updateUI();
        
        return this.conversationId;
    },
    
    // ============================================
    // STATE MANAGEMENT
    // ============================================
    
    /**
     * Toggle advanced parameters toolbar visibility
     */
    toggleAdvancedParameters() {
        this.showAdvancedParameters = !this.showAdvancedParameters;
        localStorage.setItem('sam-web-showAdvancedParameters', this.showAdvancedParameters);
        
        // Update UI
        const toolbar = document.getElementById('advancedParametersToolbar');
        const toggleBtn = document.getElementById('toggleParametersBtn');
        
        if (toolbar) {
            toolbar.style.display = this.showAdvancedParameters ? 'flex' : 'none';
        }
        
        if (toggleBtn) {
            // Update button appearance
            if (this.showAdvancedParameters) {
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.classList.remove('active');
            }
        }
        
        console.log('[Parameters] Toggled advanced parameters:', this.showAdvancedParameters);
    },
    
    /**
     * Set temperature
     */
    setTemperature(value) {
        this.temperature = parseFloat(value);
        localStorage.setItem('sam-web-temperature', this.temperature);
        console.log('[Parameters] Set temperature:', this.temperature);
    },
    
    /**
     * Set top-p
     */
    setTopP(value) {
        this.topP = parseFloat(value);
        localStorage.setItem('sam-web-topP', this.topP);
        console.log('[Parameters] Set topP:', this.topP);
    },
    
    /**
     * Enable repetition penalty
     */
    enableRepetitionPenalty() {
        this.repetitionPenalty = 1.1;  // default value
        localStorage.setItem('sam-web-repetitionPenalty', this.repetitionPenalty);
        this.updateUI();
        console.log('[Parameters] Enabled repetition penalty:', this.repetitionPenalty);
    },
    
    /**
     * Disable repetition penalty
     */
    disableRepetitionPenalty() {
        this.repetitionPenalty = null;
        localStorage.removeItem('sam-web-repetitionPenalty');
        this.updateUI();
        console.log('[Parameters] Disabled repetition penalty');
    },
    
    /**
     * Set repetition penalty value
     */
    setRepetitionPenalty(value) {
        this.repetitionPenalty = parseFloat(value);
        localStorage.setItem('sam-web-repetitionPenalty', this.repetitionPenalty);
        console.log('[Parameters] Set repetition penalty:', this.repetitionPenalty);
    },
    
    /**
     * Toggle reasoning
     */
    toggleReasoning() {
        this.enableReasoning = !this.enableReasoning;
        localStorage.setItem('sam-web-enableReasoning', this.enableReasoning);
        console.log('[Parameters] Toggled reasoning:', this.enableReasoning);
    },
    
    /**
     * Toggle tools
     */
    toggleTools() {
        this.enableTools = !this.enableTools;
        localStorage.setItem('sam-web-enableTools', this.enableTools);
        console.log('[Parameters] Toggled tools:', this.enableTools);
    },
    
    /**
     * Set model
     */
    setModel(model) {
        this.currentModel = model;
        console.log('[Parameters] Set model:', this.currentModel);
    },
    
    /**
     * Set conversation ID
     */
    setConversationId(id) {
        this.conversationId = id;
        console.log('[Parameters] Set conversation ID:', this.conversationId);
    },
    
    // ============================================
    // UI UPDATES
    // ============================================
    
    /**
     * Update UI elements to reflect current state
     */
    updateUI() {
        // Temperature slider and display
        const tempSlider = document.getElementById('temperatureSlider');
        const tempValue = document.getElementById('temperatureValue');
        if (tempSlider) tempSlider.value = this.temperature;
        if (tempValue) tempValue.textContent = this.temperature.toFixed(1);
        
        // Top-P slider and display
        const topPSlider = document.getElementById('topPSlider');
        const topPValue = document.getElementById('topPValue');
        if (topPSlider) topPSlider.value = this.topP;
        if (topPValue) topPValue.textContent = this.topP.toFixed(2);
        
        // Repetition penalty
        const repPenaltyGroup = document.getElementById('repPenaltyGroup');
        const repPenaltyAddBtn = document.getElementById('repPenaltyAddBtn');
        
        if (this.repetitionPenalty !== null) {
            // Show slider
            if (repPenaltyGroup) repPenaltyGroup.style.display = 'flex';
            if (repPenaltyAddBtn) repPenaltyAddBtn.style.display = 'none';
            
            const repSlider = document.getElementById('repPenaltySlider');
            const repValue = document.getElementById('repPenaltyValue');
            if (repSlider) repSlider.value = this.repetitionPenalty;
            if (repValue) repValue.textContent = this.repetitionPenalty.toFixed(1);
        } else {
            // Show add button
            if (repPenaltyGroup) repPenaltyGroup.style.display = 'none';
            if (repPenaltyAddBtn) repPenaltyAddBtn.style.display = 'flex';
        }
        
        // Reasoning toggle
        const reasoningToggle = document.getElementById('reasoningToggle');
        if (reasoningToggle) reasoningToggle.checked = this.enableReasoning;
        
        // Tools toggle
        const toolsToggle = document.getElementById('toolsToggle');
        if (toolsToggle) toolsToggle.checked = this.enableTools;
        
        // Advanced parameters toolbar visibility
        const toolbar = document.getElementById('advancedParametersToolbar');
        if (toolbar) {
            toolbar.style.display = this.showAdvancedParameters ? 'flex' : 'none';
        }
        
        // Toggle button state
        const toggleBtn = document.getElementById('toggleParametersBtn');
        if (toggleBtn) {
            if (this.showAdvancedParameters) {
                toggleBtn.classList.add('active');
            } else {
                toggleBtn.classList.remove('active');
            }
        }
    },
    
    // ============================================
    // API INTEGRATION
    // ============================================
    
    /**
     * Get parameters for chat API request
     * Returns object with all relevant parameters
     */
    getRequestParams() {
        const params = {};
        
        // Conversation ID
        if (this.conversationId) {
            params.conversation_id = this.conversationId;
        }
        
        // Model (handled separately in sendMessage, but included for completeness)
        // params.model = this.currentModel;
        
        // Stream is always true for web UI
        params.stream = true;
        
        // Advanced parameters
        params.temperature = this.temperature;
        params.top_p = this.topP;
        
        // Note: max_tokens comes from model metadata, not hardcoded
        
        if (this.repetitionPenalty !== null) {
            params.repetition_penalty = this.repetitionPenalty;
        }
        
        // Reasoning (only send if enabled)
        if (this.enableReasoning) {
            params.reasoning = true;
        }
        
        // Note: Tools are handled by SAM configuration, not per-request
        // We don't send a tools parameter in the API request
        
        return params;
    },
    
    /**
     * Get state for saving to conversation
     * Returns settings object to be saved with conversation
     */
    getConversationSettings() {
        return {
            showAdvancedParameters: this.showAdvancedParameters,
            temperature: this.temperature,
            topP: this.topP,
            repetitionPenalty: this.repetitionPenalty,
            enableReasoning: this.enableReasoning,
            enableTools: this.enableTools
        };
    }
};
