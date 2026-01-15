// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * Folder Management for SAM Web UI
 * Handles folder state and API operations
 */

const Folders = {
    // State
    folders: [],
    collapsedFolders: new Set(),
    
    /**
     * Initialize folders system
     */
    async init() {
        console.log('Folders.init() starting...');
        
        // Load collapsed state from localStorage
        const collapsed = localStorage.getItem('sam-web-collapsed-folders');
        if (collapsed) {
            try {
                const folderIds = JSON.parse(collapsed);
                this.collapsedFolders = new Set(folderIds);
                console.log('Loaded collapsed folders from localStorage:', folderIds);
            } catch (e) {
                console.error('Failed to parse collapsed folders:', e);
            }
        }
        
        // Fetch folders from API
        await this.fetchFolders();
        console.log('Folders.init() complete. Folders:', this.folders);
    },
    
    /**
     * Fetch all folders from API
     */
    async fetchFolders() {
        console.log('Fetching folders from API...');
        try {
            const response = await API.request('/api/folders', { method: 'GET' });
            console.log('API response for folders:', response);
            this.folders = response.folders || [];
            console.log(`Loaded ${this.folders.length} folders`);
        } catch (error) {
            console.error('Failed to fetch folders:', error);
            this.folders = [];
        }
    },
    
    /**
     * Create a new folder
     */
    async createFolder(name, color = null, icon = null) {
        try {
            const response = await API.request('/api/folders', {
                method: 'POST',
                body: JSON.stringify({ name, color, icon })
            });
            
            // Add to local state
            this.folders.push(response);
            console.log('Created folder:', name);
            
            return response;
        } catch (error) {
            console.error('Failed to create folder:', error);
            throw error;
        }
    },
    
    /**
     * Update folder (rename, change color/icon, toggle collapsed)
     */
    async updateFolder(folderId, updates) {
        try {
            await API.request(`/api/folders/${folderId}`, {
                method: 'PATCH',
                body: JSON.stringify(updates)
            });
            
            // Update local state
            const folder = this.folders.find(f => f.id === folderId);
            if (folder) {
                Object.assign(folder, updates);
            }
            
            console.log('Updated folder:', folderId);
        } catch (error) {
            console.error('Failed to update folder:', error);
            throw error;
        }
    },
    
    /**
     * Delete a folder
     */
    async deleteFolder(folderId) {
        try {
            await API.request(`/api/folders/${folderId}`, {
                method: 'DELETE'
            });
            
            // Remove from local state
            this.folders = this.folders.filter(f => f.id !== folderId);
            this.collapsedFolders.delete(folderId);
            this.saveCollapsedState();
            
            console.log('Deleted folder:', folderId);
        } catch (error) {
            console.error('Failed to delete folder:', error);
            throw error;
        }
    },
    
    /**
     * Toggle folder collapsed state
     */
    toggleCollapsed(folderId) {
        if (this.collapsedFolders.has(folderId)) {
            this.collapsedFolders.delete(folderId);
        } else {
            this.collapsedFolders.add(folderId);
        }
        
        this.saveCollapsedState();
    },
    
    /**
     * Check if folder is collapsed
     */
    isCollapsed(folderId) {
        return this.collapsedFolders.has(folderId);
    },
    
    /**
     * Save collapsed state to localStorage
     */
    saveCollapsedState() {
        const folderIds = Array.from(this.collapsedFolders);
        localStorage.setItem('sam-web-collapsed-folders', JSON.stringify(folderIds));
    },
    
    /**
     * Get folder by ID
     */
    getFolder(folderId) {
        return this.folders.find(f => f.id === folderId);
    },
    
    /**
     * Get all folders sorted alphabetically
     */
    getAllFolders() {
        return [...this.folders].sort((a, b) => a.name.localeCompare(b.name));
    }
};
