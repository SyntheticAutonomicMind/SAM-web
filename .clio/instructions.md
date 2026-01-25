# CLIO Project Instructions - SAM-webapp

**Project:** SAM (Synthetic Autonomic Mind) Web Interface  
**Language:** TypeScript/React (frontend) + FastAPI/Python (backend)  
**Type:** Web application providing browser-based access to SAM AI assistant  
**Purpose:** Remote access to SAM from any device with a web browser


## CRITICAL: READ FIRST BEFORE ANY WORK

### The Unbroken Method (Core Principles)

This project follows **The Unbroken Method** for human-AI collaboration. This isn't just project style—it's the core operational framework.

**The Seven Pillars:**

1. **Continuous Context** - Never break the conversation. Maintain momentum through collaboration checkpoints.
2. **Complete Ownership** - If you find a bug, fix it. No "out of scope."
3. **Investigation First** - Read code before changing it. Never assume.
4. **Root Cause Focus** - Fix problems, not symptoms.
5. **Complete Deliverables** - No partial solutions. Finish what you start.
6. **Structured Handoffs** - Document everything for the next session.
7. **Learning from Failure** - Document mistakes to prevent repeats.

**If you skip this, you will violate the project's core methodology.**

### Collaboration Checkpoint Discipline

**Use `user_collaboration` tool at EVERY key decision point:**

| Checkpoint | When | Purpose |
|-----------|------|---------|
| Session Start | Always | Confirm context & plan |
| After Investigation | Before implementation | Share findings, get approval |
| After Implementation | Before commit | Show results, get OK |
| Session End | When work complete | Summary & handoff |

**[FAIL]** Create implementations alone without checkpointing  
**[OK]** Investigate freely, but checkpoint before committing changes


## Quick Start for NEW DEVELOPERS

### Before Touching Code

1. **Understand the system:**
   ```bash
   cat README.md                    # Project overview
   ls -la src/                      # Frontend structure
   ls -la backend/                  # Backend API structure (if separate)
   cat package.json                 # Dependencies
   ```

2. **Know the standards:**
   - **Frontend:** TypeScript/React with strict type checking
   - **State Management:** React hooks or Redux for complex state
   - **API Integration:** RESTful API client with typed interfaces
   - **Real-Time:** WebSocket for streaming SAM responses
   - **Styling:** Responsive design (desktop, tablet, mobile)
   - **Accessibility:** WCAG 2.1 AA compliance minimum
   - **Testing:** Unit tests for components, integration tests for workflows

3. **Use the toolchain:**
   ```bash
   npm install                      # Install dependencies
   npm run dev                      # Development server
   npm run build                    # Production build
   npm run test                     # Run tests
   git status                       # Always check before work
   ```

### Core Workflow

```
1. Read code first (investigation)
2. Use collaboration tool (get approval)
3. Make changes (implementation)
4. Test thoroughly (unit + integration + manual)
5. Commit with clear message (handoff)
```


## Key Directories & Files

### Frontend Structure
| Path | Purpose | Status |
|------|---------|--------|
| `src/pages/` | Page components (Chat, Settings, History) | [OK] Primary UI |
| `src/components/` | Reusable UI components | [OK] Component library |
| `src/api/` | SAM API client and integration | **CRITICAL** |
| `src/hooks/` | Custom React hooks | [OK] Reusable logic |
| `src/store/` | State management (if Redux/Zustand) | [OK] Global state |
| `src/types/` | TypeScript type definitions | **CRITICAL** |
| `src/utils/` | Helper functions, utilities | [OK] Utilities |
| `public/` | Static assets (images, icons) | [OK] Assets |

### Configuration & Build
| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `tsconfig.json` | TypeScript configuration |
| `vite.config.ts` or `webpack.config.js` | Build configuration |
| `.env.example` | Environment variable template |
| `README.md` | User and developer documentation |

### Backend (if included)
| Path | Purpose |
|------|---------|
| `backend/main.py` | FastAPI application entry point |
| `backend/api/` | API route definitions |
| `backend/models/` | Pydantic models for validation |
| `requirements.txt` | Python dependencies |


## Architecture Overview

```
User Browser
    v
React Frontend (TypeScript)
    ├─ Chat Interface (Message display, input)
    ├─ Conversation History (List, search)
    ├─ Model Selector (Choose AI provider/model)
    ├─ Settings Panel (User preferences)
    └─ Real-Time Updates (WebSocket connection)
    v
API Client Layer (src/api/)
    ├─ REST API calls (HTTP)
    ├─ WebSocket manager (Streaming)
    ├─ Authentication (Token management)
    └─ Error handling (Retry logic)
    v
SAM Backend (Native macOS app or separate server)
    ├─ /api/conversations - CRUD operations
    ├─ /api/chat/completions - Generate responses
    ├─ /api/models - List available models
    ├─ /ws/chat - WebSocket streaming endpoint
    └─ /api/auth - Authentication endpoints
    v
SAM Core (AI Processing)
    ├─ Conversation management
    ├─ AI provider integration (OpenAI, Anthropic, etc.)
    ├─ Tool execution (file ops, web search, etc.)
    └─ Memory and context management
```


## Code Standards: MANDATORY

### TypeScript: Strict Typing Required

```typescript
// [CORRECT] Always use explicit types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

function sendMessage(message: Message): Promise<Message> {
  // Implementation
}

// [FAIL] Never use 'any'
function sendMessage(message: any): any {  // ❌ NO
  // Implementation
}
```

### React Components: Functional with Hooks

```typescript
// [CORRECT] Functional component with TypeScript
import React, { useState, useEffect } from 'react';

interface ChatProps {
  conversationId: string;
  onMessageSent?: (message: Message) => void;
}

export const Chat: React.FC<ChatProps> = ({ conversationId, onMessageSent }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    // Load messages for conversation
  }, [conversationId]);
  
  return (
    <div className="chat-container">
      {/* UI */}
    </div>
  );
};

// [FAIL] Class components (legacy pattern)
class Chat extends React.Component {  // ❌ Avoid
  // ...
}
```

### API Integration: Typed Client

```typescript
// [CORRECT] Typed API client
import axios, { AxiosInstance } from 'axios';

export class SAMApiClient {
  private client: AxiosInstance;
  
  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
  
  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await this.client.post<Message>('/api/chat/completions', {
      conversation_id: conversationId,
      message: content
    });
    return response.data;
  }
}

// [FAIL] Untyped fetch calls everywhere
const response = await fetch(url);  // ❌ No types, no error handling
const data = await response.json(); // ❌ Unknown type
```

### WebSocket Management: Connection Handling

```typescript
// [CORRECT] Robust WebSocket manager
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect(url: string, onMessage: (data: any) => void): void {
    this.ws = new WebSocket(url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    this.ws.onclose = () => {
      this.handleReconnect(url, onMessage);
    };
  }
  
  private handleReconnect(url: string, onMessage: (data: any) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      setTimeout(() => this.connect(url, onMessage), delay);
    }
  }
  
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// [FAIL] No reconnection logic
const ws = new WebSocket(url);  // ❌ What if it disconnects?
ws.onmessage = (e) => console.log(e.data);
```


## Testing Requirements

### Before Committing Changes

```bash
# 1. Type checking
npm run type-check

# 2. Linting
npm run lint

# 3. Unit tests
npm run test

# 4. Build test
npm run build

# 5. Manual testing
npm run dev
# - Open http://localhost:5173 (or configured port)
# - Test conversation creation
# - Test message sending
# - Test WebSocket streaming
# - Test model selection
# - Test settings persistence
# - Test on mobile viewport
```

### Testing Checklist

- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Unit tests pass for modified components
- [ ] API integration works with real SAM backend
- [ ] WebSocket streaming displays messages correctly
- [ ] Error handling shows user-friendly messages
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] Accessibility: keyboard navigation works
- [ ] Accessibility: screen reader friendly (ARIA labels)
- [ ] No console errors or warnings in browser
- [ ] Production build succeeds and runs


## Commit Workflow

### Commit Message Format
```bash
type(scope): brief description

Problem: What was broken/missing/incomplete
Solution: How you fixed it
Testing: How you verified the fix
```

**Types:** feat, fix, refactor, docs, test, style, chore  
**Scope:** chat, api, auth, components, hooks, websocket, ui

**Example:**
```bash
git add src/api/client.ts src/components/Chat.tsx
git commit -m "feat(websocket): add automatic reconnection with exponential backoff

Problem: WebSocket disconnections left users with broken chat
Solution: Implemented WebSocketManager with exponential backoff reconnection
Testing: Simulated network interruptions, verified auto-reconnect works, streaming resumes"
```


## Anti-Patterns: NEVER DO THESE

| Anti-Pattern | Why | What To Do Instead |
|--------------|-----|-------------------|
| Use `any` type in TypeScript | Defeats type safety | Use proper interfaces/types |
| Make blocking API calls in render | Causes UI freezes | Use `useEffect` and async patterns |
| Store API keys in frontend code | Security vulnerability | Proxy through backend or use env vars |
| Load entire conversation history at once | Performance issues | Paginate or lazy-load messages |
| Ignore WebSocket disconnections | Broken user experience | Implement reconnection logic |
| Assume one model/provider only | Limits flexibility | Design for multiple models from start |
| Skip error handling | Users see cryptic errors | Show user-friendly messages, retry logic |
| Hardcode API URLs | Breaks in different environments | Use environment variables |
| No loading states | Users don't know what's happening | Show spinners, progress indicators |
| Inaccessible UI | Excludes users with disabilities | ARIA labels, keyboard navigation |


## Session Handoff Procedures (MANDATORY)

### CRITICAL: Session Handoff Directory Structure

When ending a session, **ALWAYS** create a properly structured handoff directory:

```
ai-assisted/YYYYMMDD/HHMM/
├── CONTINUATION_PROMPT.md  [MANDATORY] - Next session's complete context
├── AGENT_PLAN.md           [MANDATORY] - Remaining priorities & blockers
├── CHANGELOG.md            [OPTIONAL]  - User-facing changes (if applicable)
└── NOTES.md                [OPTIONAL]  - Additional technical notes
```

**NEVER COMMIT** `ai-assisted/` directory to git. Always verify before committing:

```bash
git status  # Ensure no ai-assisted/ files staged
git add -A
git status  # Double-check
git commit -m "message"
```


## Documentation

### What Needs Documentation

- **New features** - Update README.md with user-facing description
- **API changes** - Update API client documentation
- **Component usage** - JSDoc comments in component files
- **Configuration changes** - Update .env.example
- **Breaking changes** - Document in README with migration guide
- **Known issues** - Add to README or KNOWN_ISSUES.md

### Code Documentation Standards

```typescript
/**
 * Chat component for displaying conversation messages and input.
 * 
 * @param conversationId - Unique ID of the conversation to display
 * @param onMessageSent - Optional callback when user sends a message
 * 
 * @example
 * ```tsx
 * <Chat 
 *   conversationId="conv-123" 
 *   onMessageSent={(msg) => console.log(msg)}
 * />
 * ```
 */
export const Chat: React.FC<ChatProps> = ({ conversationId, onMessageSent }) => {
  // Implementation
};
```


## Quality Checklist

### Before Submitting Code

- [ ] TypeScript strict mode passes
- [ ] All props and functions have proper types
- [ ] Components are functional (not class-based)
- [ ] State management is clear and efficient
- [ ] API calls have error handling
- [ ] Loading states are shown during async operations
- [ ] WebSocket handles disconnections gracefully
- [ ] UI is responsive (mobile, tablet, desktop)
- [ ] Keyboard navigation works
- [ ] ARIA labels present for accessibility
- [ ] No hardcoded API URLs or secrets
- [ ] Environment variables documented in .env.example
- [ ] Code is readable and maintainable
- [ ] No console.log statements (use proper logging)
- [ ] Tests pass for modified code


## Notes

- SAM-webapp is the **user-facing interface** to an AI system—UX is critical
- Real-time responsiveness matters—optimize WebSocket performance
- Streaming responses should feel natural and readable
- Error messages should help users understand what went wrong
- Accessibility is important—many users have diverse needs
- Performance optimization is ongoing (cache, lazy-load, code-split)
- Integration with SAM backend is foundational—respect the API contract
- Security: Never expose API keys or sensitive data in frontend
- Cross-browser compatibility: Test on Chrome, Firefox, Safari, Edge
- Mobile experience: Many users will access from tablets/phones
