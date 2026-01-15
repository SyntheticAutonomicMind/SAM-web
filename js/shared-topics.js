// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * Shared Topics Management for SAM Web UI
 * Handles shared topic state and API operations
 */

const SharedTopics = {
    // State
    topics: [],
    currentTopicId: null,  // Topic ID for active conversation
    enabled: false,         // Whether shared topics is enabled for active conversation
    
    /**
     * Initialize shared topics system
     */
    async init() {
        console.log('[SharedTopics] init() starting...');
        
        // Fetch topics from API
        await this.fetchTopics();
        console.log(`[SharedTopics] init() complete. Loaded ${this.topics.length} topics`);
    },
    
    /**
     * Fetch all shared topics from API
     */
    async fetchTopics() {
        console.log('[SharedTopics] Fetching topics from API...');
        try {
            const response = await API.request('/api/shared-topics', { method: 'GET' });
            console.log('[SharedTopics] API response:', response);
            this.topics = response.topics || [];
            console.log(`[SharedTopics] Loaded ${this.topics.length} topics`);
        } catch (error) {
            console.error('[SharedTopics] Failed to fetch topics:', error);
            this.topics = [];
        }
    },
    
    /**
     * Create a new shared topic
     */
    async createTopic(name, description = null) {
        try {
            console.log('[SharedTopics] Creating topic:', name);
            const response = await API.request('/api/shared-topics', {
                method: 'POST',
                body: JSON.stringify({ name, description })
            });
            
            // Add to local state
            this.topics.push(response);
            console.log('[SharedTopics] Created topic:', response);
            
            return response;
        } catch (error) {
            console.error('[SharedTopics] Failed to create topic:', error);
            throw error;
        }
    },
    
    /**
     * Update shared topic
     */
    async updateTopic(topicId, updates) {
        try {
            console.log('[SharedTopics] Updating topic:', topicId, updates);
            await API.request(`/api/shared-topics/${topicId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            
            // Update local state
            const topic = this.topics.find(t => t.id === topicId);
            if (topic) {
                Object.assign(topic, updates);
            }
            
            console.log('[SharedTopics] Updated topic:', topicId);
        } catch (error) {
            console.error('[SharedTopics] Failed to update topic:', error);
            throw error;
        }
    },
    
    /**
     * Delete a shared topic
     */
    async deleteTopic(topicId) {
        try {
            console.log('[SharedTopics] Deleting topic:', topicId);
            await API.request(`/api/shared-topics/${topicId}`, {
                method: 'DELETE'
            });
            
            // Remove from local state
            this.topics = this.topics.filter(t => t.id !== topicId);
            
            // If this was the current topic, clear it
            if (this.currentTopicId === topicId) {
                this.currentTopicId = null;
            }
            
            console.log('[SharedTopics] Deleted topic:', topicId);
        } catch (error) {
            console.error('[SharedTopics] Failed to delete topic:', error);
            throw error;
        }
    },
    
    /**
     * Attach current conversation to a shared topic
     */
    async attachToConversation(conversationId, topicId) {
        try {
            console.log('[SharedTopics] Attaching topic', topicId, 'to conversation', conversationId);
            await API.request(`/v1/conversations/${conversationId}/attach-topic`, {
                method: 'POST',
                body: JSON.stringify({ topicId })
            });
            
            // Update local state
            this.currentTopicId = topicId;
            this.enabled = true;
            
            console.log('[SharedTopics] Attached topic to conversation');
            return true;
        } catch (error) {
            console.error('[SharedTopics] Failed to attach topic:', error);
            throw error;
        }
    },
    
    /**
     * Detach current conversation from shared topic
     */
    async detachFromConversation(conversationId) {
        try {
            console.log('[SharedTopics] Detaching topic from conversation', conversationId);
            await API.request(`/v1/conversations/${conversationId}/detach-topic`, {
                method: 'POST'
            });
            
            // Update local state
            this.currentTopicId = null;
            this.enabled = false;
            
            console.log('[SharedTopics] Detached topic from conversation');
            return true;
        } catch (error) {
            console.error('[SharedTopics] Failed to detach topic:', error);
            throw error;
        }
    },
    
    /**
     * Load shared topic state from conversation
     */
    loadFromConversation(conversation) {
        console.log('[SharedTopics] loadFromConversation:', conversation);
        
        if (conversation && conversation.settings) {
            this.enabled = conversation.settings.useSharedData || false;
            this.currentTopicId = conversation.settings.sharedTopicId || null;
            
            console.log('[SharedTopics] Loaded from conversation - enabled:', this.enabled, 'topicId:', this.currentTopicId);
        } else {
            this.reset();
        }
    },
    
    /**
     * Reset state (when switching conversations or creating new)
     */
    reset() {
        this.currentTopicId = null;
        this.enabled = false;
        console.log('[SharedTopics] State reset');
    },
    
    /**
     * Get topic by ID
     */
    getTopic(topicId) {
        return this.topics.find(t => t.id === topicId);
    },
    
    /**
     * Get current topic (if attached)
     */
    getCurrentTopic() {
        if (!this.currentTopicId) return null;
        return this.getTopic(this.currentTopicId);
    },
    
    /**
     * Get parameters for chat API request
     */
    getRequestParams() {
        // Shared topics don't directly affect chat request params
        // They affect working directory on backend side
        return {};
    }
};
