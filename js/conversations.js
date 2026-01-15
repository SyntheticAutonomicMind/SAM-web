// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * Conversation Management for SAM-Web
 * Handles conversation list, selection, loading, and CRUD operations
 */

const Conversations = {
    // State
    conversations: [],
    activeConversationId: null,
    activeConversation: null,
    
    /**
     * Initialize conversation system
     */
    async init() {
        // Initialize folders first
        await Folders.init();
        
        // Try to restore last active conversation
        const lastConversationId = localStorage.getItem('sam-web-last-conversation');
        
        // Load all conversations from API
        await this.loadConversations();
        
        // Restore or create conversation
        if (lastConversationId && this.conversations.find(c => c.id === lastConversationId)) {
            await this.loadConversation(lastConversationId);
        } else if (this.conversations.length > 0) {
            // Load most recent conversation
            await this.loadConversation(this.conversations[0].id);
        } else {
            // No conversations - will create one when user sends first message
            this.activeConversationId = null;
            this.activeConversation = null;
        }
    },
    
    /**
     * Load all conversations from API
     */
    async loadConversations() {
        try {
            const response = await API.getConversations();
            this.conversations = response.conversations || [];
            
            // Sort by updated date (most recent first)
            this.conversations.sort((a, b) => 
                new Date(b.updated) - new Date(a.updated)
            );
            
            // Update UI
            this.renderConversationList();
            
            return this.conversations;
        } catch (error) {
            console.error('Failed to load conversations:', error);
            Toast.error('Error: Failed to load conversation list');
            return [];
        }
    },
    
    /**
     * Load specific conversation and its messages
     */
    async loadConversation(conversationId) {
        try {
            const response = await API.getConversation(conversationId);
            
            this.activeConversationId = conversationId;
            this.activeConversation = response;
            
            // Save to localStorage for persistence
            localStorage.setItem('sam-web-last-conversation', conversationId);
            
            // Update conversation list UI (mark active)
            this.renderConversationList();
            
            // Notify app to update chat view
            if (window.onConversationLoaded) {
                window.onConversationLoaded(response);
            }
            
            return response;
        } catch (error) {
            console.error('Failed to load conversation:', error);
            Toast.error('Error: Failed to load conversation');
            throw error;
        }
    },
    
    /**
     * Create new conversation
     */
    async createConversation() {
        // Clear active conversation
        this.activeConversationId = null;
        this.activeConversation = null;
        localStorage.removeItem('sam-web-last-conversation');
        
        // Update UI
        this.renderConversationList();
        
        // Notify app to clear chat view
        if (window.onConversationLoaded) {
            window.onConversationLoaded(null);
        }
        
        Toast.show('New conversation started', 'success');
    },
    
    /**
     * Delete conversation
     */
    async deleteConversation(conversationId) {
        try {
            await API.deleteConversation(conversationId);
            
            this.conversations = this.conversations.filter(c => c.id !== conversationId);
            
            if (this.activeConversationId === conversationId) {
                // Deleted active conversation - load another or create new
                if (this.conversations.length > 0) {
                    await this.loadConversation(this.conversations[0].id);
                } else {
                    await this.createConversation();
                }
            }
            
            this.renderConversationList();
            Toast.show('Conversation deleted', 'success');
        } catch (error) {
            console.error('Failed to delete conversation:', error);
            Toast.error('Error: Failed to delete conversation');
            throw error;
        }
    },

    /**
     * Rename conversation
     */
    async renameConversation(conversationId, newTitle) {
        try {
            await API.renameConversation(conversationId, newTitle);
            
            const conversation = this.conversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.title = newTitle;
            }
            
            this.renderConversationList();
            Toast.show('Conversation renamed', 'success');
        } catch (error) {
            console.error('Failed to rename conversation:', error);
            Toast.error('Error: Failed to rename conversation');
            throw error;
        }
    },
    
    /**
     * Render conversation list in sidebar (grouped by folders)
     */
    renderConversationList() {
        const container = document.getElementById('conversationList');
        if (!container) return;
        
        console.log('renderConversationList() called with', this.conversations.length, 'conversations');
        
        container.innerHTML = '';
        
        if (this.conversations.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No conversations yet</p>
                    <p class="empty-state-hint">Start chatting to create your first conversation</p>
                </div>
            `;
            return;
        }
        
        // Group conversations by folder
        const grouped = {
            noFolder: [],
            folders: {}
        };
        
        this.conversations.forEach(conversation => {
            console.log('Processing conversation:', conversation.title, 'folderId:', conversation.folderId);
            if (conversation.folderId) {
                if (!grouped.folders[conversation.folderId]) {
                    grouped.folders[conversation.folderId] = [];
                }
                grouped.folders[conversation.folderId].push(conversation);
            } else {
                grouped.noFolder.push(conversation);
            }
        });
        
        console.log('Grouped conversations:', grouped);
        console.log('Available folders:', Folders.folders);
        
        // Render folders first (sorted alphabetically)
        const folderIds = Object.keys(grouped.folders).sort((a, b) => {
            const folderA = Folders.getFolder(a);
            const folderB = Folders.getFolder(b);
            if (!folderA || !folderB) return 0;
            return folderA.name.localeCompare(folderB.name);
        });
        
        console.log('Rendering', folderIds.length, 'folders');
        
        folderIds.forEach(folderId => {
            const folder = Folders.getFolder(folderId);
            if (!folder) {
                console.warn('Folder not found:', folderId);
                return; // Folder was deleted but conversations still reference it
            }
            
            console.log('Rendering folder:', folder.name, 'with', grouped.folders[folderId].length, 'conversations');
            
            const conversations = grouped.folders[folderId];
            const isCollapsed = Folders.isCollapsed(folderId);
            
            // Folder header
            const folderHeader = document.createElement('div');
            folderHeader.className = 'folder-header';
            if (isCollapsed) folderHeader.classList.add('collapsed');
            
            folderHeader.innerHTML = `
                <div class="folder-header-main" data-folder-id="${folderId}">
                    <svg class="folder-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 6l6 6-6 6"/>
                    </svg>
                    <span class="folder-name">${this.escapeHtml(folder.name)}</span>
                    <span class="folder-count">${conversations.length}</span>
                </div>
            `;
            
            // Toggle collapse on click
            folderHeader.querySelector('.folder-header-main').addEventListener('click', () => {
                Folders.toggleCollapsed(folderId);
                this.renderConversationList(); // Re-render
            });
            
            container.appendChild(folderHeader);
            
            // Folder conversations (only if not collapsed)
            if (!isCollapsed) {
                const folderConversations = document.createElement('div');
                folderConversations.className = 'folder-conversations';
                
                conversations.forEach(conversation => {
                    folderConversations.appendChild(this.createConversationItem(conversation));
                });
                
                container.appendChild(folderConversations);
            }
        });
        
        // Render conversations without folder
        if (grouped.noFolder.length > 0) {
            console.log('Rendering', grouped.noFolder.length, 'ungrouped conversations');
            
            // Add separator if there are folders
            if (folderIds.length > 0) {
                const separator = document.createElement('div');
                separator.className = 'folder-separator';
                container.appendChild(separator);
            }
            
            grouped.noFolder.forEach(conversation => {
                container.appendChild(this.createConversationItem(conversation));
            });
        }
    },
    
    /**
     * Create a conversation item element
     */
    createConversationItem(conversation) {
        const item = document.createElement('div');
        item.className = 'conversation-item';
        if (conversation.id === this.activeConversationId) {
            item.classList.add('active');
        }
        
        // Format date
        const date = new Date(conversation.updated);
        const dateStr = this.formatDate(date);
        
        item.innerHTML = `
            <div class="conversation-item-main" data-id="${conversation.id}">
                <div class="conversation-title" data-id="${conversation.id}">${this.escapeHtml(conversation.title)}</div>
                <div class="conversation-meta">
                    <span class="conversation-date">${dateStr}</span>
                    <span class="conversation-count">${conversation.messageCount} msgs</span>
                </div>
            </div>
            <div class="conversation-actions">
                <button class="conversation-rename" data-id="${conversation.id}" title="Rename conversation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="conversation-delete" data-id="${conversation.id}" title="Delete conversation">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/>
                    </svg>
                </button>
            </div>
        `;
        
        // Click to load conversation
        const mainDiv = item.querySelector('.conversation-item-main');
        mainDiv.addEventListener('click', () => {
            this.loadConversation(conversation.id);
        });
        
        // Rename button
        const renameBtn = item.querySelector('.conversation-rename');
        renameBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showRenameDialog(conversation.id, conversation.title);
        });
        
        // Delete button
        const deleteBtn = item.querySelector('.conversation-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${conversation.title}"?`)) {
                this.deleteConversation(conversation.id);
            }
        });
        
        return item;
    },

    /**
     * Show rename dialog
     */
    showRenameDialog(conversationId, currentTitle) {
        const newTitle = prompt('New conversation title:', currentTitle);
        if (newTitle && newTitle.trim() && newTitle !== currentTitle) {
            this.renameConversation(conversationId, newTitle.trim());
        }
    },
    
    /**
     * Format date for display
     */
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        
        // Less than 1 minute
        if (diff < 60000) {
            return 'Just now';
        }
        
        // Less than 1 hour
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins}m ago`;
        }
        
        // Less than 1 day
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours}h ago`;
        }
        
        // Less than 7 days
        if (diff < 604800000) {
            const days = Math.floor(diff / 86400000);
            return `${days}d ago`;
        }
        
        // Format as date
        return date.toLocaleDateString();
    },
    
    /**
     * Escape HTML for safe display
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Update conversation after sending message
     */
    async updateAfterMessage() {
        // Reload conversation list to get updated message counts
        await this.loadConversations();
        
        // If this was a new conversation, the server created it
        // Try to find it and set as active
        if (!this.activeConversationId && this.conversations.length > 0) {
            const newest = this.conversations[0]; // Most recent
            this.activeConversationId = newest.id;
            this.activeConversation = newest;
            localStorage.setItem('sam-web-last-conversation', newest.id);
        }
    }
};
