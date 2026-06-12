# Frontend — Agent 2.0 UI

React + TypeScript single-page application for the Agent 2.0 coding agent. Provides a chat interface, sandbox file explorer, code viewer, and settings dialog.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build**: Vite 4
- **Styling**: Tailwind CSS 3
- **UI Primitives**: Radix UI (Dialog, ScrollArea, Select, Separator, Tooltip)
- **State Management**: Zustand 5 with `persist` middleware

## Project Structure

```
src/
├── components/       UI components (ChatPanel, SettingsDialog, MemorySidebar, etc.)
├── state/            Zustand slices (uiSlice, chatSlice, settingsSlice, filesSlice)
├── store/            Store re-exports
├── hooks/            Custom hooks (useChatStream)
├── contexts/         React contexts (Theme, Toast)
├── lib/              API utilities
├── types/            TypeScript type definitions
└── utils/            Utility functions
```

## Scripts

| Command           | Description |
|-------------------|-------------|
| `npm run dev`     | Start dev server on port 3000 |
| `npm run build`   | Type-check and build for production |
| `npm run preview` | Preview production build |

## Environment

Create a `.env` file:

```
VITE_BACKEND_URL=http://localhost:8000
```

## Key Features

- Chat interface with SSE streaming from the backend
- Persistent settings (API keys, model selection) via Zustand + localStorage
- Sandbox file explorer with live tree updates after tool calls
- Code viewer for inspecting generated files
- Memory sidebar for agent context
- Responsive layout: desktop, tablet, and mobile breakpoints
- Dark theme
