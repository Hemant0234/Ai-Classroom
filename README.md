# CU Classroom

CU Classroom is a real-time collaborative learning platform built with Next.js 14, Clerk, Convex, Liveblocks, and LiveKit. It combines shared whiteboards, collaborative coding spaces, AI-assisted learning, and integrated audio/video communication in a single workspace-oriented product.

## Highlights

- Real-time whiteboards with drawing, shapes, text, and sticky notes
- Collaborative compiler workspace with shared live editing
- AI assistant panel for summaries, explanations, and learning support
- Built-in LiveKit audio and video calling
- Clerk-based authentication with organization workspaces
- Search and favourites for quick workspace access

## Tech Stack

- Next.js 14 with App Router
- React 18
- TypeScript
- Tailwind CSS and shadcn/ui
- Clerk for authentication and organizations
- Convex for app data, queries, and mutations
- Liveblocks for shared room presence and storage
- LiveKit for real-time audio/video communication
- Gemini API for AI assistance

## Project Structure

```text
app/
  (dashboard)/        Dashboard views and navigation
  api/                Server routes for auth, AI, and LiveKit
  board/              Whiteboard workspace
  compiler/           Collaborative compiler workspace
components/           Shared UI and workspace components
config/               App metadata and configuration
convex/               Convex schema, queries, and mutations
hooks/                Custom React hooks
lib/                  Shared utilities
providers/            App-level providers
store/                Zustand stores
types/                Shared TypeScript types
public/               Static assets
```

## Core Workspace Model

- `Board` workspaces use Liveblocks storage for canvas layers and presence
- `Compiler` workspaces use Liveblocks storage for collaborative code editing
- Convex stores metadata such as titles, ownership, organization IDs, and favourites
- Clerk manages authentication and organization context

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file and add the required keys for:

- Clerk
- Convex
- Liveblocks
- LiveKit
- Gemini API

### 3. Start the development server

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Current Feature Areas

### Whiteboard

- Multi-user collaborative canvas
- Shape creation and freehand drawing
- Text notes and layer interactions
- Live cursors and participant presence

### Compiler

- Shared real-time code editor
- Organization-scoped collaborative workspace
- Shared participant presence

### AI Assistant

- Role-aware assistant modes for student and teacher flows
- Board-context summaries and support prompts
- Image-assisted prompting

### Communication

- Floating PiP-style call panel
- In-workspace audio and video collaboration

## Notes

- Board and compiler collaboration are powered by Liveblocks room storage
- Organization-aware access checks are handled through Clerk and server-side auth routes
- Convex is used for persistent app metadata, not the high-frequency collaborative document state

## License

This project is licensed under the terms of the [LICENSE](./LICENSE) file.
