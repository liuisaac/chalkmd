# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**chalk.md** is an open-source, cross-platform desktop markdown note-taking application built as a Go port of Obsidian. It uses a **Go backend + React frontend** architecture via the Wails framework, with WYSIWYG editing powered by TipTap.

## Development Commands

### Prerequisites
- Go 1.23+
- Node.js & npm
- Wails CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Essential Commands
- `wails dev` - Start live development server (Vite + Go with hot reload)
- `wails build` - Build production binary for current OS
- `cd ui && npm install` - Install frontend dependencies
- `go mod tidy` - Clean up Go dependencies

### Frontend-Only Commands (from ui/ directory)
- `npm run dev` - Start Vite dev server (called by `wails dev`)
- `npm run build` - Build production bundle (called by `wails build`)

## Architecture

### Technology Stack
- **Backend**: Go 1.23 + Wails v2.11.0 + trash-go (safe file deletion)
- **Frontend**: React 18.2 + Vite 3.0.7 + TipTap 3.15.3 (WYSIWYG editor)
- **Styling**: Tailwind CSS 3.4.19
- **Code Editing**: CodeMirror 6.x
- **Math Rendering**: KaTeX 0.16.9
- **Markdown**: Marked 11.2.0 + tiptap-markdown

### Directory Structure

```
chalkmd/
├── main.go                    # Wails app entry point
├── wails.json                 # Wails configuration
├── settings.json              # Runtime config (autoSaveInterval: 100ms)
│
├── internal/                  # Go backend
│   ├── app.go                 # App struct and initialization
│   ├── vault.go               # Vault operations (open, list, select)
│   ├── files.go               # File CRUD (read, create, write, delete, rename, move)
│   ├── assets.go              # Binary file handling (images)
│   └── window.go              # Multi-window support
│
└── ui/                        # React frontend
    ├── src/
    │   ├── main.jsx           # React root
    │   ├── App.jsx            # Main component with auto-save logic
    │   ├── VaultProvider.jsx  # Global vault state & file operations
    │   ├── TabProvider.jsx    # Tab/history state management
    │   │
    │   ├── fs/                # Frontend-to-backend wrappers
    │   │   ├── vault.js       # Vault operations
    │   │   ├── file.js        # File operations
    │   │   ├── assets.js      # Binary asset handling
    │   │   └── window.js      # Window spawning
    │   │
    │   └── components/
    │       ├── start/         # Vault selection screen
    │       └── editor/        # Main editor interface
    │           ├── tab/       # Tab management
    │           ├── filetree/  # Sidebar file browser
    │           ├── render/    # Editor rendering
    │           │   └── wysiwyg/
    │           │       ├── CustomEditor.js        # TipTap setup
    │           │       ├── default/               # Node types (Bold, Italic, Header, CodeBlock, LaTeX, etc.)
    │           │       ├── extensions/            # Custom extensions
    │           │       ├── hotkeys/               # Keyboard shortcuts
    │           │       └── plugins/               # ClipboardImagePlugin, etc.
    │           └── stores/    # State management (HistoryManager)
    │
    └── wailsjs/               # Auto-generated Go bindings (DO NOT EDIT)
```

### Key Architectural Patterns

#### 1. Context Providers Pattern
- **VaultProvider**: Manages vault path, file list, current file, content
- **TabProvider**: Manages editor tabs and navigation history
- Both wrap the app and expose state via React Context

#### 2. Frontend-to-Backend Communication
All file system operations flow through this pattern:
```
React Component
  ↓
VaultProvider method (e.g., createFile)
  ↓
fs/file.js wrapper
  ↓
Auto-generated wailsjs/go/internal/App binding
  ↓
Go backend method (internal/files.go)
  ↓
File system
```

#### 3. Security: Path Traversal Protection
**CRITICAL**: All file operations in `internal/files.go` validate paths with:
```go
if !strings.HasPrefix(fullPath, a.currentVault) {
    return fmt.Errorf("invalid path: outside vault")
}
```
This prevents access to files outside the vault. **Always maintain this pattern** when adding new file operations.

#### 4. Auto-Save Pattern
- Content changes trigger debounced save (100ms delay, configurable via `settings.json`)
- Implemented in `App.jsx` using `useEffect` with timeout
- Calls `WriteFile` RPC to Go backend

#### 5. History Management
- `HistoryManager` store persists per-file undo/redo stacks
- History saved when switching between files to preserve undo capability
- Located in `ui/src/components/editor/stores/HistoryManager.js`

#### 6. Multi-Window Support
- `spawnInstance()` in VaultProvider spawns new editor windows
- Backend window management in `internal/window.go`

### Critical Implementation Details

#### File Operations
- **CreateFile**: Automatically appends `.md` extension if missing (files.go:45-47)
- **DeleteFile**: Uses `trash-go` to move files to system trash instead of permanent deletion
- All operations require a vault to be opened first (`if a.currentVault == ""` checks)

#### WYSIWYG Editor
- TipTap editor with custom node types in `ui/src/components/editor/render/wysiwyg/default/`
- Markdown serialization/deserialization in `CustomEditor.js`
- Custom nodes: Bold, Italic, Headers, Bullets, Checkboxes, CodeBlocks, LaTeX, Images
- ClipboardImagePlugin captures pasted images and saves as base64 binaries

#### Binary Assets
- Images pasted into editor are saved via `WriteBinaryFile` (base64 encoded)
- `ReadBinaryFile` loads images for display
- Both operations in `internal/assets.go` and wrapped in `ui/src/fs/assets.js`

#### Local Storage Usage
- `vaultPath`: Currently opened vault path
- `vaultHistory`: List of recently opened vaults
- Auto-opens last vault on startup (VaultProvider.jsx:91-98)

### Configuration Files

#### wails.json
- Defines app name, output filename, window dimensions
- Frontend paths: `ui/` directory, `npm install`, `npm run build`
- Icons and platform-specific settings

#### settings.json
```json
{
  "autoSaveInterval": 100,              // Auto-save delay in milliseconds
  "developmentMode": false,
  "developmentSettings": {
    "bypassLocalStorage": false         // Skip localStorage for testing
  }
}
```

#### tailwind.config.js
Custom colors: `topbar`, `midbar`, `offwhite`, `offpurple`
Custom fonts: Syne, Inconsolata, Inter

## Working with This Codebase

### Adding New File Operations
1. Add Go method to `internal/files.go` or `internal/vault.go`
2. Add path traversal validation (`strings.HasPrefix`)
3. Run `wails dev` to regenerate bindings in `ui/wailsjs/`
4. Create wrapper in `ui/src/fs/file.js` or `ui/src/fs/vault.js`
5. Expose via VaultProvider if needed for global access

### Adding New Editor Nodes
1. Create new node file in `ui/src/components/editor/render/wysiwyg/default/`
2. Follow pattern from existing nodes (Bold.js, Italic.js, etc.)
3. Import and add to TipTap extensions in `CustomEditor.js`
4. Add markdown serialization rules if needed

### Modifying UI Components
- Use Tailwind classes for styling (defined in tailwind.config.js)
- Access vault state via `useVault()` hook from VaultProvider
- Access tab state via `useTabs()` hook from TabProvider
- Run `wails dev` for hot reload during development

### Wails Bindings
- **DO NOT EDIT** files in `ui/wailsjs/` - they are auto-generated
- Regenerated automatically when running `wails dev` or `wails build`
- Based on exported Go methods with capital first letter in `internal/` package

## Project Policies

From README.md:
- Prioritize **performance** and **local-first data integrity**
- Maintain **clean Go implementation**
- Target main branch for pull requests
- Follow submission checklist in PR templates
