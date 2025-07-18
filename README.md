# Jantteri Game

A full-stack game application with React frontend and Flask backend, sharing protobuf message definitions.

## Project Structure

```
jantteri-game/
├── web/                    # React frontend (Vite + React Router)
│   ├── app/               # React application code
│   ├── protobuild/        # Generated TypeScript protobuf files
│   └── package.json       # Web dependencies
├── api/                    # Flask backend
│   ├── protobuild/        # Generated Python protobuf files
│   └── requirements.txt   # Python dependencies
├── proto/                  # Protobuf source files
│   ├── Dockerfile         # Docker build for protobuf generation
│   ├── jantteri_messages.proto
│   └── jantteri_messages.options
├── protobuild.sh          # Script to build protobuf files
└── package.json           # Root orchestration scripts
```

## Development

### Prerequisites
- Node.js (for React frontend)
- Python 3.x (for Flask backend)
- Docker (for protobuf generation)

### Quick Start
```bash
# Install web dependencies
npm run install:web

# Install API dependencies (when implemented)
npm run install:api

# Build protobuf files
npm run proto:build

# Start development servers
npm run dev
```

### Individual Commands
```bash
# Frontend only
npm run dev:web

# Backend only
npm run dev:api

# Build protobuf files
npm run proto:build
```

## Protobuf Integration

The project uses shared protobuf definitions for type-safe communication between frontend and backend:

- **Source**: `proto/jantteri_messages.proto`
- **Web**: Generated TypeScript files in `web/protobuild/`
- **API**: Generated Python files in `api/protobuild/`

### Building Protobuf Files
```bash
./protobuild.sh
```

This generates:
- TypeScript definitions for the React frontend
- Python classes for the Flask backend
- C files for embedded devices (future use)

## Access URLs

- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:5000/ (when implemented)

## Features

- 🚀 React Router v7 with server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 🔄 WebSocket integration with Socket.IO
- 🗺️ Interactive maps with Leaflet
- 📦 Protobuf for type-safe communication
- 🎉 TailwindCSS for styling
- 🐍 Flask backend (planned)

## Building for Production

```bash
# Build frontend
npm run build

# The output will be in web/build/
```
