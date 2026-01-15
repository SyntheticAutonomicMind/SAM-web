# SAM-Web Development - Session Start Guide

**Read this EVERY session start before beginning work.**

---

## Project Overview

**SAM-Web** is a modern, feature-complete web interface for SAM (Synthetic Autonomic Mind).

- **Repository:** https://github.com/SyntheticAutonomicMind/sam-web
- **Main SAM Repo:** https://github.com/SyntheticAutonomicMind/SAM
- **Technology:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Architecture:** Zero dependencies, no build step, offline-first
- **Purpose:** Provide 100% feature parity with SAM native app via REST API

---

## Critical Development Principles

### 1. No Dependencies Policy
- **NO npm packages** - All code is vanilla JavaScript
- **NO build tools** - No webpack, vite, parcel, etc.
- **NO frameworks** - No React, Vue, Angular, Svelte
- **NO CSS preprocessors** - Pure CSS with custom properties
- **NO CDNs** - All assets self-hosted (offline-first)

**Why:** Simplicity, reliability, security, offline functionality

### 2. Browser Compatibility
- **Target:** Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Features:** ES6+, Server-Sent Events, LocalStorage, Fetch API
- **Graceful degradation:** Core features work without JavaScript where possible
- **Testing:** Test in at least 2 browsers before committing

### 3. Code Standards
- **JavaScript:** ES6+, semicolons required, 4-space indentation
- **CSS:** Custom properties for theming, mobile-first responsive design
- **HTML:** Semantic HTML5, accessibility first (WCAG 2.1 AA)
- **Naming:** Clear, descriptive names; follow existing patterns

### 4. API Integration
- **Base URL:** `http://localhost:8080` (SAM API server)
- **Authentication:** Bearer token via `Authorization` header
- **Streaming:** Server-Sent Events for chat responses
- **Error Handling:** Always handle network errors gracefully
- **CORS:** SAM provides CORS headers, don't disable security

---

## Session Start Workflow

### STEP 1: Understand Context

Before reading code or making changes:

1. **Ask the user:**
   - What feature are they requesting?
   - Is this a bug fix or new feature?
   - Any specific requirements or constraints?

2. **Check for continuation:**
   - Look in `ai-assisted/YYYY-MM-DD/` for recent handoffs
   - Read `CONTINUATION_PROMPT.md` if exists
   - Review `AGENT_PLAN.md` for ongoing work

3. **Review recent commits:**
   ```bash
   git log --oneline -10
   git status
   ```

### STEP 2: Investigate First

Never edit code without understanding it first:

1. **Read related files:**
   - If fixing chat: read `index.html`, `js/api.js`, `js/conversations.js`
   - If adding feature: search for similar patterns
   - Check how existing code solves similar problems

2. **Search for patterns:**
   ```bash
   grep -r "functionName" js/
   grep -r "className" css/
   ```

3. **Test current behavior:**
   - Run local server: `python3 -m http.server 8000`
   - Open in browser, test manually
   - Check browser console for errors

### STEP 3: Plan Changes

Before writing code:

1. **Use collaboration checkpoint:**
   ```
   📋 Investigation complete:
   - Found: [what you discovered]
   - Cause: [root cause if bug]
   - Solution: [proposed fix/feature]
   - Files to modify: [list]
   - Testing plan: [how to verify]
   
   Approve this plan?
   ```

2. **Wait for approval** before implementing

### STEP 4: Implement

Follow these rules:

1. **Make minimal changes:**
   - Fix the specific issue, don't refactor unrelated code
   - Follow existing code style and patterns
   - Keep functions small and focused

2. **Handle errors:**
   ```javascript
   try {
       await API.request('/endpoint');
   } catch (error) {
       console.error('[Module] Error:', error);
       Toast.error('User-friendly message');
   }
   ```

3. **Use consistent logging:**
   ```javascript
   console.log('[ModuleName] Action:', data);
   console.error('[ModuleName] Error:', error);
   ```

4. **Accessibility:**
   - Keyboard navigation (Tab, Enter, Escape)
   - ARIA labels for interactive elements
   - Semantic HTML elements
   - Focus management

### STEP 5: Test

Before committing:

1. **Manual testing:**
   ```bash
   # Start local server
   python3 -m http.server 8000
   
   # Test in browser
   # - Does feature work?
   # - Any console errors?
   # - Mobile responsive?
   # - Keyboard accessible?
   ```

2. **Use collaboration checkpoint:**
   ```
   ✅ Implementation complete:
   - Changed: [files modified]
   - Tested: [what you tested]
   - Result: [working/broken/needs help]
   
   Ready to commit?
   ```

3. **Wait for approval** before committing

### STEP 6: Commit

Follow commit message format:

```
type(scope): brief description

**Problem:**
[what was broken or missing]

**Solution:**
[how you fixed or built it]

**Testing:**
✅ Manual: [what you tested]
✅ Browsers: [which browsers tested]
✅ Edge cases: [what you verified]

**Files:**
- [list of changed files]
```

**Types:** feat, fix, refactor, docs, style, perf
**Scope:** chat, api, ui, prompts, folders, etc.

---

## File Structure

### JavaScript Modules

| File | Purpose | Key Functions |
|------|---------|---------------|
| `api.js` | SAM API client | `request()`, `streamChat()` |
| `conversations.js` | Conversation CRUD | `create()`, `load()`, `save()`, `delete()` |
| `prompts.js` | System/mini-prompts | `loadSystemPrompts()`, `loadMiniPrompts()` |
| `folders.js` | Folder management | `fetchFolders()`, `createFolder()` |
| `shared-topics.js` | Shared topics | `fetchTopics()`, `attachToConversation()` |
| `parameters.js` | Model parameters | `getParameters()`, `updateParameters()` |
| `personalities.js` | Personality selector | `loadPersonalities()` |
| `utils/markdown.js` | Markdown rendering | `render()`, `renderToolCard()` |
| `utils/toast.js` | Toast notifications | `Toast.success()`, `Toast.error()` |

### CSS Organization

| File | Purpose |
|------|---------|
| `style.css` | Core design system, variables, base styles |
| `chat.css` | Chat interface layout and messages |
| `chat-header.css` | Chat header, metadata, controls |
| `sidebar.css` | Conversation sidebar |
| `prompt-sidebar.css` | Prompts and mini-prompts sidebar |
| `toolbar.css` | Parameters toolbar |
| `folders.css` | Folder management UI |
| `components.css` | Reusable components (buttons, modals, cards) |
| `code-blocks.css` | Code syntax highlighting |
| `markdown-content.css` | Markdown rendering styles |
| `markdown-toolcards.css` | Tool execution cards |

---

## Common Tasks

### Adding a New Feature

1. Check if similar feature exists (search codebase)
2. Plan UI and API integration
3. Create HTML structure (semantic, accessible)
4. Add CSS (follow design system)
5. Implement JavaScript (error handling, logging)
6. Test thoroughly (manual + multiple browsers)
7. Commit with descriptive message

### Fixing a Bug

1. Reproduce the bug (exact steps)
2. Check browser console for errors
3. Find root cause (investigate, don't guess)
4. Fix the cause, not the symptom
5. Verify fix works AND doesn't break anything else
6. Commit with problem/solution in message

### Improving UI

1. Follow existing design patterns
2. Use CSS custom properties (variables)
3. Ensure mobile responsive (test at 375px, 768px, 1024px)
4. Maintain accessibility (keyboard, screen readers)
5. Test in light and dark themes

---

## API Endpoints Reference

### Chat
- `POST /v1/chat/completions` - Stream chat response (SSE)
- `POST /api/chat/completions` - Non-streaming chat

### Conversations
- `GET /api/conversations` - List all conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation by ID
- `DELETE /api/conversations/:id` - Delete conversation
- `PATCH /api/conversations/:id` - Update conversation

### Prompts
- `GET /api/prompts/system` - List system prompts
- `GET /api/mini-prompts` - List mini-prompts
- `POST /api/mini-prompts` - Create mini-prompt
- `PATCH /api/mini-prompts/:id` - Update mini-prompt
- `DELETE /api/mini-prompts/:id` - Delete mini-prompt

### Shared Topics
- `GET /api/shared-topics` - List shared topics
- `POST /api/shared-topics` - Create shared topic
- `PATCH /api/shared-topics/:id` - Update shared topic
- `DELETE /api/shared-topics/:id` - Delete shared topic
- `POST /v1/conversations/:id/attach-topic` - Attach topic
- `POST /v1/conversations/:id/detach-topic` - Detach topic

### Folders
- `GET /api/folders` - List folders
- `POST /api/folders` - Create folder
- `PATCH /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### Models & Providers
- `GET /api/models` - List available models
- `GET /api/providers` - List configured providers

---

## Debugging Tips

### Browser Console

```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');

// Check API connection
API.request('/api/models').then(console.log).catch(console.error);

// Inspect global state
console.log('Conversations:', Conversations);
console.log('Prompts:', Prompts);
console.log('Parameters:', Parameters);
```

### Network Issues

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Check request headers (Authorization present?)
4. Check response status (200 OK, 401 Unauthorized, 500 Error?)
5. Inspect response body for error messages

### CSS Issues

1. Open DevTools → Elements tab
2. Inspect element styles
3. Check which CSS rules apply
4. Look for overridden styles
5. Test in different screen sizes (Responsive Design Mode)

---

## Anti-Patterns (DON'T DO THESE)

❌ **Add external dependencies** (npm packages, CDNs)  
✅ Implement feature in vanilla JavaScript

❌ **Skip error handling** in async functions  
✅ Always wrap in try/catch, show user-friendly errors

❌ **Hardcode values** when data is available from API  
✅ Query API for dynamic data

❌ **Ignore accessibility** (keyboard, screen readers)  
✅ Test with keyboard-only navigation, add ARIA labels

❌ **Write inline styles** in JavaScript  
✅ Add/remove CSS classes, keep styles in CSS files

❌ **Copy-paste code** without understanding it  
✅ Read and understand existing code first

❌ **Commit without testing** manually  
✅ Test in browser, check console for errors

❌ **Fix symptoms** instead of root causes  
✅ Investigate why the bug occurs, fix the cause

---

## Testing Checklist

Before committing any change:

- [ ] Feature works as expected
- [ ] No errors in browser console
- [ ] Works in Chrome AND Safari (or Firefox)
- [ ] Mobile responsive (test at 375px width)
- [ ] Dark theme works correctly
- [ ] Keyboard accessible (Tab, Enter, Escape)
- [ ] Error handling works (test with SAM offline)
- [ ] Doesn't break existing features
- [ ] Code follows existing patterns
- [ ] Commit message is descriptive

---

## Handoff Protocol

If session must end with incomplete work:

1. **Update documentation** (if behavior changed)
2. **Commit all changes** (even WIP)
3. **Create handoff** in `ai-assisted/YYYY-MM-DD/HHMM/`:
   - `CONTINUATION_PROMPT.md` - Complete context
   - `AGENT_PLAN.md` - Remaining work
   - Include commits made, files changed, testing status
4. **Use collaboration checkpoint** for final validation

---

## Quick Reference

### Start Server
```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

### Search Codebase
```bash
grep -r "pattern" js/      # Search JavaScript
grep -r "pattern" css/     # Search CSS
```

### Check Recent Work
```bash
git log --oneline -10      # Last 10 commits
git diff                   # Uncommitted changes
git status                 # File status
```

### Test API
```bash
curl -H "Authorization: Bearer TOKEN" http://localhost:8080/api/models
```

---

## Remember

- **Investigate before implementing** - Understand the code first
- **Use collaboration checkpoints** - Keep user in the loop
- **Test thoroughly** - Manual testing in browser is mandatory
- **Commit descriptively** - Explain problem and solution
- **Follow existing patterns** - Consistency over cleverness

The goal is **working, maintainable, accessible code** that follows web standards.

---

**For detailed methodology, see:** `ai-assisted/THE_UNBROKEN_METHOD.md`

