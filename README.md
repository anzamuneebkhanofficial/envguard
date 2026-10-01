# EnvGuard

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=flat-square)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=flat-square)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-green.svg?style=flat-square)](https://nodejs.org)
[![Express](https://img.shields.io/badge/express-5.0-black.svg?style=flat-square)](https://expressjs.com)
[![Next.js](https://img.shields.io/badge/next.js-16.3-black.svg?style=flat-square)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/mongodb-8.0-green.svg?style=flat-square)](https://www.mongodb.com)

EnvGuard is an open-source environment variable drift detector and audit tool for development teams. It tracks variable additions, edits, and deletions across projects without storing plaintext secrets.

> ⭐ **Support Open Source:** If EnvGuard saved your team from broken builds or unannounced variable changes, please consider giving us a star on GitHub! It helps other developers discover the project.

---

## The Problem

Environment configuration drifts when developers add new variables locally without notifying teammates. When another developer pulls the repository, the application crashes on missing keys.

Teams lose time answering basic questions:
- Which key was introduced or deleted?
- Who made the change and when?
- Has `.env.example` been updated with the new requirement?

EnvGuard automates audit trails, keeps `.env.example` templates in sync, and notifies teams when sensitive variables change.

---

## Key Features

- **Zero-Plaintext Storage:** Raw values exist in memory only during sync. Stored values use a fixed masking rule:
  - Strings 8 characters or fewer: `****`
  - Strings over 8 characters: First 4 characters + `****` + Last 4 characters
- **Short SHA-256 Fingerprints:** A 12-character hash verifies whether a value changed without revealing the secret.
- **Automatic `.env.example` Generation:** Generates blank template files instantly from current project variables.
- **Drift Alerts:** Flags sensitive keys (`JWT_`, `STRIPE_`, `DB_PASS`, `PRIVATE_KEY`) and sends HTTP webhooks or SMTP emails.
- **Role-Based Access Control:** Three access levels (Owner, Editor, Viewer) secure configuration updates.
- **Developer CLI:** Includes standalone scripts to upload variables and pull clean templates directly from a terminal.

---

## Role-Based Access Control

| Action | Owner | Editor | Viewer |
| :--- | :---: | :---: | :---: |
| View variables (masked) and timeline | Yes | Yes | Yes |
| Export `.env` and `.env.example` | Yes | Yes | Yes |
| Add, sync, and edit variables | Yes | Yes | No |
| Delete variables | Yes | Yes | No |
| Invite or remove members | Yes | No | No |
| Configure webhooks and alerts | Yes | Read-only | Read-only |
| Rename or delete project | Yes | No | No |

---

## Architecture

```text
               ┌─────────────────────────┐
               │    Next.js 16 Web UI    │
               │   (React 19, Tailwind)  │
               └────────────┬────────────┘
                            │
                            │ HTTP / JSON
                            ▼
               ┌─────────────────────────┐
               │    Express 5 API        │
               │  (Node.js, TypeScript)  │
               └────────────┬────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
   ┌───────────┐      ┌───────────┐      ┌───────────┐
   │  MongoDB  │      │ Webhooks  │      │   SMTP    │
   │    8.0    │      │ (Slack)   │      │ (Emails)  │
   └───────────┘      └───────────┘      └───────────┘
```

### Module Structure

The backend source lives in `api/src/modules/` with 5 domain modules:
- `auth/`: User registration, JWT login, and profile fetching.
- `project/`: Workspace CRUD, membership lists, and RBAC enforcement.
- `variable/`: Masking logic, diff engine, and `.env.example` generation.
- `change/`: Immutable audit timeline with pagination and filtering.
- `alert/`: Webhook dispatches and Nodemailer SMTP notifications.

---

## Project Structure

```text
ENV/
├── api/                   # Express 5 backend & CLI tools (see api/README.md)
│   ├── cli/               # CLI upload and sync scripts
│   ├── src/
│   │   ├── config/        # Environment and database configuration
│   │   ├── middleware/    # Auth, validation, rate limiting, errors
│   │   ├── modules/       # Domain modules (auth, project, variable, change, alert)
│   │   └── shared/        # Errors, hashing, and response helpers
│   └── package.json
├── web/                   # Next.js 16 frontend (see web/README.md)
│   ├── app/               # App Router pages and dashboard layouts
│   ├── components/        # UI components, modals, and diff views
│   ├── hooks/             # Data-fetching hooks (TanStack Query)
│   ├── lib/               # API client and utilities
│   └── package.json
├── docker-compose.yml     # Multi-container setup for local development
└── LICENSE                # MIT License
```

---

## Quick Start

### Mode A: Native Setup

#### Prerequisites
- **Node.js**: v20 or later
- **MongoDB**: v8.0 running locally on `localhost:27017` or via MongoDB Atlas

#### 1. Start the API
```bash
cd api
npm install
cp .env.example .env
npm run dev
```
The API starts at `http://localhost:4000`. Health check: `http://localhost:4000/health`.

#### 2. Start the Frontend
```bash
cd ../web
npm install
cp .env.local.example .env.local
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Mode B: Docker Compose

Start the full stack (MongoDB, API, and Web UI) with one command:

```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- API Server: `http://localhost:4000`
- MongoDB: `localhost:27017`

---

## Environment Variables

### Backend (`api/.env`)

```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/envguard
JWT_SECRET=change-this-to-a-secure-random-string-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
PROJECTS_PAGE_LIMIT=6
VARIABLES_PAGE_LIMIT=10
HISTORY_PAGE_LIMIT=8
MEMBERS_PAGE_LIMIT=5
ACTIVITY_RETENTION_DAYS=7
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=EnvGuard <noreply@envguard.local>
```

### Frontend (`web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=EnvGuard
NEXT_PUBLIC_GITHUB_REPO=
```

---

## CLI Usage

The API package includes two standalone CLI commands.

### Upload and Sync Variables

Parses a local `.env` file, masks values, and synchronizes with the server:

```bash
npx envg-upload --file .env --project <PROJECT_ID> --api http://localhost:4000 --token <JWT>
```

You can also export `ENVGUARD_TOKEN` in your environment instead of passing `--token`.

### Download Blank `.env.example`

Pulls the auto-generated `.env.example` for a project:

```bash
npx envguard-sync-example --project <PROJECT_ID> --output .env.example --api http://localhost:4000 --token <JWT>
```

#### CLI Flags
- `-p, --project <id>`: Target project ID (required)
- `-f, --file <path>`: Local file path to read (default: `.env`)
- `-o, --output <path>`: Local path to save template (default: `.env.example`)
- `-a, --api <url>`: EnvGuard API endpoint (default: `http://localhost:4000`)
- `-t, --token <jwt>`: User JWT token (optional if `ENVGUARD_TOKEN` is set)
- `-h, --help`: Show help text

---

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Authenticate and receive a JWT
- `GET /api/auth/me` — Get the current user session

### Projects
- `GET /api/projects` — List user projects
- `POST /api/projects` — Create a new project
- `GET /api/projects/:id` — Get project details
- `PATCH /api/projects/:id` — Update project metadata (Owner only)
- `DELETE /api/projects/:id` — Delete project (Owner only)
- `POST /api/projects/:id/members` — Add member with role (Owner only)
- `DELETE /api/projects/:id/members/:userId` — Remove member (Owner only)

### Variables
- `GET /api/projects/:projectId/variables` — List project variables
- `POST /api/projects/:projectId/variables/sync` — Sync variable list from file or CLI
- `PATCH /api/projects/:projectId/variables/:key` — Update a single variable
- `DELETE /api/projects/:projectId/variables/:key` — Delete a variable
- `GET /api/projects/:projectId/variables/export/env` — Export masked `.env` content
- `GET /api/projects/:projectId/variables/export/example` — Export blank `.env.example`

### History & Alerts
- `GET /api/projects/:projectId/changes` — List paginated change audit events
- `GET /api/projects/:projectId/changes/:changeId` — Get event details
- `GET /api/alerts/:projectId` — Fetch project alert preferences
- `PUT /api/alerts/:projectId` — Update webhook and email alert preferences
- `POST /api/alerts/test-webhook` — Send a test webhook notification

---

## Development & Verification

Run type checks and production builds inside each subfolder:

```bash
# Verify API
cd api
npm run typecheck
npm run build

# Verify Web
cd ../web
npm run typecheck
npm run build
```

---

## Documentation Links

- Detailed manual testing scenarios: [MANUAL_TESTING.md](MANUAL_TESTING.md)
- Backend & CLI specifics: [api/README.md](api/README.md)
- Frontend application guide: [web/README.md](web/README.md)

---

## License

This project is licensed under the [MIT License](LICENSE).
