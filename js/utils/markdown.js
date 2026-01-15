// SPDX-License-Identifier: GPL-3.0-only
// SPDX-FileCopyrightText: Copyright (c) 2026 Andrew Wyatt (Fewtarius)

/**
 * SAM-Web Markdown Renderer
 * Simple markdown-to-HTML converter with syntax highlighting
 */

const Markdown = {
    /**
     * Convert markdown to HTML
     */
    render(text) {
        if (!text) return '';

        let html = text;

        // Code blocks FIRST (before escaping) to preserve code content
        html = this.renderCodeBlocks(html);

        // Now escape HTML in non-code parts
        // Split by code blocks, escape each part, then rejoin
        const codeBlockPlaceholder = '___CODE_BLOCK___';
        const codeBlocks = [];
        let blockIndex = 0;
        
        // Extract code blocks
        html = html.replace(/<pre class="code-block"[\s\S]*?<\/pre>/g, (match) => {
            codeBlocks.push(match);
            return `${codeBlockPlaceholder}${blockIndex++}`;
        });

        // Extract mermaid blocks
        html = html.replace(/<div class="mermaid-diagram"[\s\S]*?<\/div>/g, (match) => {
            codeBlocks.push(match);
            return `${codeBlockPlaceholder}${blockIndex++}`;
        });

        // Now escape the remaining HTML
        const div = document.createElement('div');
        div.textContent = html;
        html = div.innerHTML;

        // Restore code blocks
        codeBlocks.forEach((block, i) => {
            html = html.replace(`${codeBlockPlaceholder}${i}`, block);
        });

        // Inline code (after escaping)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Images (must be before links)
        html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" loading="lazy" />');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Headers (must be before horizontal rules)
        html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');
        html = html.replace(/^\*\*\*$/gm, '<hr>');

        // Blockquotes
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

        // Tables (simple GFM tables)
        html = this.renderTables(html);

        // Bold (after tables to avoid breaking table separators)
        html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
        html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

        // Strikethrough
        html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

        // Unordered lists
        html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Ordered lists
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>\s*<\/p>/g, '');

        return html;
    },

    /**
     * Render simple GFM-style tables
     */
    renderTables(text) {
        const lines = text.split('\n');
        let inTable = false;
        let result = [];
        let tableRows = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Check if line is a table row (contains |)
            if (line.includes('|') && !line.match(/^```/)) {
                const cells = line.split('|').map(c => c.trim()).filter(c => c);

                // Check if next line is separator (---|---|---)
                const nextLine = lines[i + 1]?.trim() || '';
                const isSeparator = nextLine.match(/^\|?\s*-+\s*(\|\s*-+\s*)+\|?\s*$/);

                if (isSeparator && !inTable) {
                    // Start of table - this line is header
                    inTable = true;
                    tableRows.push(`<thead><tr>${cells.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>`);
                    i++; // Skip separator line
                } else if (inTable) {
                    // Table row
                    tableRows.push(`<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`);
                } else {
                    // Not a table, just regular content
                    result.push(line);
                }
            } else {
                // End of table if we were in one
                if (inTable) {
                    tableRows.push('</tbody>');
                    result.push(`<table>${tableRows.join('')}</table>`);
                    tableRows = [];
                    inTable = false;
                }
                result.push(line);
            }
        }

        // Close table if still open
        if (inTable) {
            tableRows.push('</tbody>');
            result.push(`<table>${tableRows.join('')}</table>`);
        }

        return result.join('\n');
    },

    /**
     * Render code blocks with syntax highlighting
     */
    renderCodeBlocks(text) {
        // Match ```language\ncode\n```
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        
        return text.replace(codeBlockRegex, (match, language, code) => {
            const lang = language || 'plaintext';
            const escapedCode = code.trim();
            
            // Special handling for Mermaid diagrams
            if (lang === 'mermaid') {
                return this.renderMermaid(escapedCode);
            }
            
            // Apply syntax highlighting if hljs is available
            let highlightedCode = escapedCode;
            if (typeof hljs !== 'undefined') {
                try {
                    if (lang && lang !== 'plaintext' && hljs.getLanguage(lang)) {
                        highlightedCode = hljs.highlight(escapedCode, { language: lang }).value;
                    } else {
                        highlightedCode = hljs.highlightAuto(escapedCode).value;
                    }
                } catch (e) {
                    console.warn('Syntax highlighting failed:', e);
                }
            }
            
            return `<pre class="code-block" data-language="${lang}"><code class="language-${lang}">${highlightedCode}</code><button class="copy-code-btn" onclick="Markdown.copyCode(this)">Copy</button></pre>`;
        });
    },

    /**
     * Render Mermaid diagram
     */
    renderMermaid(code) {
        const id = 'mermaid-' + Math.random().toString(36).substr(2, 9);
        const escapedCode = this.escapeHtml(code);
        
        // Return a div that will be rendered by Mermaid.js after page load
        return `<div class="mermaid-diagram" id="${id}" data-mermaid="${escapedCode.replace(/"/g, '&quot;')}">${escapedCode}</div>`;
    },

    /**
     * Initialize Mermaid diagrams
     * Call this after rendering content with mermaid blocks
     */
    async initializeMermaid() {
        if (typeof mermaid === 'undefined') {
            console.warn('Mermaid.js not loaded');
            return;
        }

        const diagrams = document.querySelectorAll('.mermaid-diagram');
        
        for (const diagram of diagrams) {
            const code = diagram.getAttribute('data-mermaid');
            if (!code || diagram.classList.contains('mermaid-rendered')) continue;
            
            try {
                // Clear the diagram and render
                diagram.textContent = '';
                diagram.removeAttribute('data-mermaid');
                diagram.classList.add('mermaid-rendered');
                
                // Use Mermaid's render function
                const { svg } = await mermaid.render(diagram.id + '-svg', code);
                diagram.innerHTML = svg;
            } catch (error) {
                console.error('Mermaid rendering error:', error);
                diagram.innerHTML = `<div class="mermaid-error">Failed to render diagram: ${error.message}</div>`;
            }
        }
    },

    /**
     * Copy code to clipboard
     */
    copyCode(button) {
        const pre = button.closest('pre');
        const code = pre.querySelector('code').textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            Toast.error('Failed to copy code');
        });
    },

    /**
     * Escape HTML entities
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Detect if text contains tool card markers
     * Tool cards have formats like:
     * - "SUCCESS: Action: details"
     * - "<tool_call>...</tool_call>"
     * - Tool execution status markers
     */
    hasToolCard(text) {
        return text.includes('SUCCESS:') || 
               text.includes('<tool_call>') ||
               text.includes('[TOOL_CALLS]') ||
               text.includes('EXECUTING:');
    },

    /**
     * Parse tool cards from text
     * Returns array of {type, name, status, details}
     */
    parseToolCards(text) {
        const cards = [];
        const lines = text.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // SUCCESS: format
            const successMatch = line.match(/^SUCCESS:\s*(.+?):\s*(.+)$/);
            if (successMatch) {
                cards.push({
                    type: 'tool',
                    name: successMatch[1].trim(),
                    status: 'success',
                    details: successMatch[2].trim()
                });
                continue;
            }

            // EXECUTING: format
            const executingMatch = line.match(/^EXECUTING:\s*(.+)$/);
            if (executingMatch) {
                cards.push({
                    type: 'tool',
                    name: executingMatch[1].trim(),
                    status: 'running',
                    details: ''
                });
                continue;
            }

            // <tool_call> XML format
            if (line.includes('<tool_call>')) {
                try {
                    const match = text.match(/<tool_call>([\s\S]*?)<\/tool_call>/);
                    if (match) {
                        const data = JSON.parse(match[1]);
                        cards.push({
                            type: 'tool',
                            name: data.name || 'Unknown Tool',
                            status: 'running',
                            details: JSON.stringify(data.arguments || {})
                        });
                    }
                } catch (e) {
                    console.error('Failed to parse tool_call XML:', e);
                }
            }
        }

        return cards;
    }
};
