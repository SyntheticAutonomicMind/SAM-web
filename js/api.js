// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * SAM API Client
 * Handles all communication with SAM's REST API
 */

const API = {
    baseURL: 'http://localhost:8080',
    token: null,

    /**
     * Initialize API client
     */
    init() {
        this.token = localStorage.getItem('sam-api-token');
        this.baseURL = localStorage.getItem('sam-api-url') || 'http://localhost:8080';
    },

    /**
     * Set API authentication token
     */
    setToken(token) {
        this.token = token;
        localStorage.setItem('sam-api-token', token);
    },

    /**
     * Set API base URL
     */
    setBaseURL(url) {
        this.baseURL = url;
        localStorage.setItem('sam-api-url', url);
    },

    /**
     * Check if authenticated
     */
    isAuthenticated() {
        return !!this.token;
    },

    /**
     * Get default headers for API requests
     */
    getHeaders(additionalHeaders = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...additionalHeaders
        };

        // Add Bearer token if available
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    },

    /**
     * Make API request with retry logic
     */
    async request(endpoint, options = {}, retries = 2) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            ...options,
            headers: this.getHeaders(options.headers)
        };

        let lastError;
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, config);

                // Handle non-JSON responses
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    return await response.text();
                }

                const data = await response.json();

                if (!response.ok) {
                    // Extract error message from response
                    const errorMessage = data.error?.message || data.error || data.detail || `HTTP ${response.status}`;
                    
                    // Special handling for specific errors
                    if (response.status === 401) {
                        localStorage.removeItem('sam-api-token');
                        window.location.href = 'login.html';
                        throw new Error('Authentication failed. Please login again.');
                    }
                    
                    throw new Error(errorMessage);
                }

                return data;
            } catch (error) {
                lastError = error;
                
                // Don't retry on authentication errors or client errors
                if (error.message.includes('Authentication') || error.message.includes('HTTP 4')) {
                    throw error;
                }
                
                // Network error - retry
                if (attempt < retries && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                    console.log(`Request failed, retrying (${attempt + 1}/${retries})...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                    continue;
                }
                
                // Final attempt failed
                if (attempt === retries) {
                    break;
                }
            }
        }
        
        // All retries failed
        if (lastError.name === 'TypeError' && lastError.message.includes('fetch')) {
            throw new Error('Cannot connect to SAM API. Is the server running?');
        }
        throw lastError;
    },

    /**
     * Health check
     */
    async health() {
        return this.request('/health', { method: 'GET' });
    },

    /**
     * Get available models
     */
    async getModels() {
        return this.request('/v1/models', { method: 'GET' });
    },

    /**
     * Get system prompts
     */
    async getSystemPrompts() {
        return this.request('/api/prompts/system', { method: 'GET' });
    },

    /**
     * Get mini-prompts
     */
    async getMiniPrompts() {
        return this.request('/api/mini-prompts', { method: 'GET' });
    },

    /**
     * Get conversations list
     */
    async getConversations() {
        return this.request('/v1/conversations', { method: 'GET' });
    },

    /**
     * Get specific conversation
     */
    async getConversation(conversationId) {
        return this.request(`/v1/conversations/${conversationId}`, { method: 'GET' });
    },

    /**
     * Delete conversation
     */
    async deleteConversation(conversationId) {
        return this.request(`/v1/conversations/${conversationId}`, { method: 'DELETE' });
    },

    /**
     * Rename conversation
     */
    async renameConversation(conversationId, newTitle) {
        return this.request(`/v1/conversations/${conversationId}`, {
            method: 'PATCH',
            body: JSON.stringify({ title: newTitle })
        });
    },

    /**
     * Send chat completion (non-streaming)
     */
    async chatCompletion(request) {
        return this.request('/v1/chat/completions', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    },

    /**
     * Send chat completion (streaming via SSE)
     * Returns an EventSource object
     */
    chatCompletionStreaming(request, onChunk, onComplete, onError) {
        // For streaming, we need to use EventSource with POST body
        // SAM uses POST with stream:true parameter
        const streamRequest = {
            ...request,
            stream: true
        };

        // Create a unique request ID for tracking
        const requestId = Math.random().toString(36).substring(7);

        // Use fetch for streaming response
        fetch(`${this.baseURL}/v1/chat/completions`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(streamRequest),
            mode: 'cors'
        })
        .then(response => {
            console.log('[API] Streaming response status:', response.status, response.statusText);
            console.log('[API] Streaming response headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            const processStream = () => {
                reader.read().then(({ done, value }) => {
                    if (done) {
                        if (onComplete) onComplete();
                        return;
                    }

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    
                    // Keep last incomplete line in buffer
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.trim() === '') continue;
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            
                            if (data === '[DONE]') {
                                if (onComplete) onComplete();
                                return;
                            }

                            try {
                                const chunk = JSON.parse(data);
                                if (onChunk) onChunk(chunk);
                            } catch (e) {
                                console.error('Failed to parse streaming chunk:', e, data);
                            }
                        }
                    }

                    processStream();
                }).catch(error => {
                    if (onError) onError(error);
                });
            };

            processStream();
        })
        .catch(error => {
            console.error('[API] Streaming error details:', error);
            console.error('[API] Error name:', error.name);
            console.error('[API] Error message:', error.message);
            console.error('[API] Error stack:', error.stack);
            if (onError) onError(error);
        });
    },

    /**
     * Send tool response for user collaboration
     */
    async submitToolResponse(toolCallId, approved, userResponse) {
        return this.request('/api/chat/tool-response', {
            method: 'POST',
            body: JSON.stringify({
                tool_call_id: toolCallId,
                approved,
                user_response: userResponse
            })
        });
    },

    /**
     * Start autonomous workflow
     */
    async startAutonomousWorkflow(goal, sessionId) {
        return this.request('/api/chat/autonomous', {
            method: 'POST',
            body: JSON.stringify({
                goal,
                session_id: sessionId
            })
        });
    },

    /**
     * Download model
     */
    async downloadModel(modelSpec) {
        return this.request('/api/models/download', {
            method: 'POST',
            body: JSON.stringify(modelSpec)
        });
    },

    /**
     * Get download status
     */
    async getDownloadStatus(downloadId) {
        return this.request(`/api/models/download/${downloadId}/status`, {
            method: 'GET'
        });
    },

    /**
     * Cancel download
     */
    async cancelDownload(downloadId) {
        return this.request(`/api/models/download/${downloadId}`, {
            method: 'DELETE'
        });
    },

    /**
     * Get installed models
     */
    async getInstalledModels() {
        return this.request('/api/models', { method: 'GET' });
    },

    /**
     * Get shared topics
     */
    async getSharedTopics() {
        return this.request('/api/topics', { method: 'GET' });
    },

    /**
     * Get MCP tools (debug endpoint)
     */
    async getMCPTools() {
        return this.request('/debug/mcp/tools', { method: 'GET' });
    },

    /**
     * Execute MCP tool (debug endpoint)
     */
    async executeMCPTool(toolName, parameters) {
        return this.request('/debug/mcp/execute', {
            method: 'POST',
            body: JSON.stringify({
                tool_name: toolName,
                parameters
            })
        });
    }
};

// Initialize on load
if (typeof window !== 'undefined') {
    API.init();
}
