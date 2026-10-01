# EnvGuard Web Dashboard

Next.js 16 web application and dashboard for EnvGuard.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4 & PostCSS
- **State & Data Fetching:** TanStack React Query v5
- **Forms & Validation:** React Hook Form & Zod 3
- **Icons & Visuals:** Lucide React, Google Material Symbols, Recharts
- **Language:** TypeScript 5 (Strict Mode)

---

## Directory Structure

```text
web/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── (dashboard)/      # Protected dashboard views
│   │   ├── projects/     # Project list, overview, variables, history, settings
│   │   └── layout.tsx    # Dashboard shell and navigation
│   ├── globals.css       # Tailwind 4 theme, design tokens, fonts
│   └── layout.tsx        # Root HTML layout with query providers
├── components/           # Reusable UI components
│   ├── alerts/           # Alert preference forms and test modals
│   ├── history/          # Diff viewer, timeline, and audit items
│   ├── projects/         # Project cards, modal dialogs, member tables
│   ├── ui/               # Button, Input, Modal, Badge, Card, Spinner
│   └── variables/        # Variable table, sync modal, manual entry
├── hooks/                # Custom React Query hooks (useProjects, useVariables, useAuth)
├── lib/                  # Axios/fetch API client, token storage
└── package.json
```

---

## Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `next dev -p 3000` | Start Next.js development server on port 3000 |
| `npm run build` | `next build` | Create optimized production build |
| `npm run start` | `next start -p 3000` | Run production server |
| `npm run typecheck` | `tsc --noEmit` | Validate TypeScript types |

---

## Environment Configuration

Create `.env.local` inside `web/`:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Express API endpoint | `http://localhost:4000/api` |
| `NEXT_PUBLIC_APP_NAME` | Application title | `EnvGuard` |
| `NEXT_PUBLIC_GITHUB_REPO` | Optional repository link | (blank) |

---

## Development

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
