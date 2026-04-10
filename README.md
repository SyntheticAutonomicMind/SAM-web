# SAM-Web

**Modern Web Interface for SAM (Synthetic Autonomic Mind)**

A feature-complete web interface for [SAM](https://github.com/SyntheticAutonomicMind/SAM) that provides full functionality through SAM's REST API.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Platform](https://img.shields.io/badge/platform-Web-green.svg)](https://developer.mozilla.org/en-US/docs/Web)

[Website](https://www.syntheticautonomicmind.org) | [SAM Repository](https://github.com/SyntheticAutonomicMind/SAM)

---

## Features

### 💬 **Complete Chat Interface**
- Real-time streaming responses via Server-Sent Events
- Message history with Markdown rendering
- Code syntax highlighting
- Tool execution with interactive approval
- Image attachments and generation

### 🤖 **Multi-Provider AI Support**
- **Cloud**: OpenAI, Anthropic, GitHub Copilot, Google Gemini, DeepSeek
- **Local**: GGUF models (llama.cpp), MLX models (Apple Silicon)
- Automatic model detection and listing
- Provider-specific features and settings

### 🎛️ **Advanced Configuration**
- **System Prompts**: Full personality/prompt selection
- **Mini-Prompts**: Quick context injection with management UI
- **Shared Topics**: Share context between conversations
- **Folders**: Organize conversations
- **Parameters**: Temperature, top_p, max tokens, context window
- **Tools**: Enable/disable specific tool categories

### 📁 **Conversation Management**
- Create, save, load, and delete conversations
- Export conversations (JSON, Markdown, Plain Text, PDF)
- Search and filter conversations
- Folder organization
- Conversation settings persistence

### 🎨 **Modern UX**
- Responsive design (desktop, tablet, mobile)
- Dark/light theme with system preference detection
- Offline-first architecture
- No external dependencies or CDNs
- Accessible (WCAG 2.1 AA compliant)

---

## Quick Start

### Prerequisites

1. **SAM** must be running with API server enabled
   - Download SAM: [GitHub Releases](https://github.com/SyntheticAutonomicMind/SAM/releases)
   - Enable API in SAM Preferences → API Server
2. Get your **API token** from SAM Preferences → API Server
3. (Optional) Enable "Allow Remote Access" for network access

### Installation

**Option 1: Standalone Server**

Clone this repository and serve it:

```bash
git clone https://github.com/SyntheticAutonomicMind/sam-web.git
cd sam-web

# Using Python
python3 -m http.server 8000

# Using Node.js  
npx http-server -p 8000 --cors

# Using Caddy
caddy file-server --listen :8000
```

Then open http://localhost:8000

**Option 2: Embedded in SAM**

SAM can serve SAM-Web directly. Copy this directory to SAM's resources and access at:
```
http://localhost:8080/web
```

### First-Time Setup

1. Open SAM-Web in your browser
2. Enter your SAM API token from Preferences
3. Click "Connect to SAM"
4. Start chatting!

---

## Project Structure

```
sam-web/
├── README.md              # This file
├── index.html             # Main chat interface (SPA)
├── login.html             # Token authentication page
├── css/
│   ├── style.css          # Core design system
│   ├── chat.css           # Chat interface styles
│   ├── chat-header.css    # Chat header and metadata
│   ├── sidebar.css        # Conversation sidebar
│   ├── prompt-sidebar.css # Prompts sidebar
│   ├── components.css     # Reusable UI components
│   ├── toolbar.css        # Parameters toolbar
│   ├── folders.css        # Folder management
│   ├── code-blocks.css    # Code syntax highlighting
│   ├── markdown-content.css # Markdown rendering
│   ├── markdown-toolcards.css # Tool execution cards
│   └── highlight-theme.css # Code highlighting theme
├── js/
│   ├── api.js             # SAM API client
│   ├── conversations.js   # Conversation management
│   ├── prompts.js         # System and mini-prompts
│   ├── personalities.js   # Personality selection
│   ├── parameters.js      # Model parameters
│   ├── folders.js         # Folder management
│   ├── shared-topics.js   # Shared topic management
│   └── utils/
│       ├── markdown.js    # Markdown rendering
│       ├── toast.js       # Toast notifications
│       └── highlight.min.js # Syntax highlighting
└── .gitignore
```

---

## Architecture

### Technology Stack

- **Frontend:** Pure HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API:** SAM REST API (OpenAI-compatible + extensions)
- **Authentication:** Bearer token authentication
- **Streaming:** Server-Sent Events (SSE) for real-time responses
- **Storage:** LocalStorage for settings, SessionStorage for state

### Design Principles

1. **No Build Step** - Pure web standards, no bundler required
2. **Zero Dependencies** - No npm packages, all assets self-hosted
3. **Offline First** - Works without internet connection
4. **Progressive Enhancement** - Degrades gracefully without JavaScript
5. **Accessibility** - WCAG 2.1 AA compliant, keyboard navigable
6. **Performance** - Lazy loading, minimal DOM updates, optimized rendering

### API Integration

SAM-Web communicates with SAM via REST API:

- **Base URL:** `http://localhost:8080` (or custom port)
- **Authentication:** `Authorization: Bearer YOUR_TOKEN`
- **Streaming:** SSE endpoint for real-time chat responses
- **Endpoints:** Full SAM API including custom extensions

---

## Development

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/SyntheticAutonomicMind/sam-web.git
   cd sam-web
   ```

2. Start a local server (any HTTP server works):
   ```bash
   python3 -m http.server 8000
   ```

3. Open http://localhost:8000 in your browser

4. Connect to running SAM instance

### Code Style

- **JavaScript:** ES6+, no transpilation
- **CSS:** Custom properties for theming, no preprocessor
- **HTML:** Semantic HTML5, accessible markup
- **Formatting:** 4-space indentation, semicolons required

---

## Troubleshooting

### "Failed to connect to SAM"

1. Verify SAM is running
2. Check API server is enabled in SAM Preferences
3. Confirm API token is correct
4. Check firewall/network settings for port 8080

### "CORS errors in browser console"

SAM includes CORS headers by default. If using custom setup:
1. Ensure SAM API server allows your origin
2. Check browser security settings
3. Try running SAM-Web from same origin as SAM

### "Models not loading"

1. Verify models are installed in SAM
2. Check model provider is configured
3. Refresh the page to reload model list

---

## Contributing

Contributions welcome! Please:

1. Follow the code style guide
2. Add tests for new features
3. Update documentation
4. Submit pull request with clear description

---

## Part of the Ecosystem

SAM-Web is part of [Synthetic Autonomic Mind](https://github.com/SyntheticAutonomicMind) - a family of open source AI tools:

- **[SAM](https://github.com/SyntheticAutonomicMind/SAM)** - Native macOS AI assistant. SAM-Web connects to SAM's API server.
- **[CLIO](https://github.com/SyntheticAutonomicMind/CLIO)** - AI code assistant for the terminal. Runs on macOS and Linux.
- **[MIRA](https://github.com/SyntheticAutonomicMind/MIRA)** - Native graphical terminal for CLIO. Runs on macOS, Linux, and Windows.
- **[ALICE](https://github.com/SyntheticAutonomicMind/ALICE)** - GPU-accelerated image generation server with web interface and OpenAI-compatible API

---

## License

SAM-Web is part of SAM and licensed under the GNU General Public License v3.0.

See [LICENSE](LICENSE) for full details.

---

## Support

- **Documentation:** [SAM Docs](https://www.syntheticautonomicmind.org/docs)
- **Issues:** [GitHub Issues](https://github.com/SyntheticAutonomicMind/sam-web/issues)
- **Discussions:** [GitHub Discussions](https://github.com/SyntheticAutonomicMind/sam-web/discussions)

---

[Website](https://www.syntheticautonomicmind.org) | [SAM Repository](https://github.com/SyntheticAutonomicMind/SAM) | [Report Bug](https://github.com/SyntheticAutonomicMind/sam-web/issues)
