# EnvGuard API & CLI

Backend API service and developer CLI tools for EnvGuard.

---

## Tech Stack

- **Runtime:** Node.js >= 20 (ES Modules)
- **Framework:** Express 5
- **Database:** MongoDB 8.0 via Mongoose 8
- **Validation:** Zod 3
- **Authentication:** JWT (jsonwebtoken) & bcryptjs
- **Notifications:** Nodemailer & Native Fetch (HTTP Webhooks)
- **Language:** TypeScript 5 (Strict Mode)

---

## Directory Structure

```text
api/
├── cli/                 # Standalone developer CLI tools
│   ├── envg-upload.ts   # Upload and sync local .env to server
│   ├── sync-example.ts  # Download blank .env.example
│   ├── api-client.ts    # Direct HTTP client for CLI commands
│   └── parser.ts        # .env parsing and key extraction
├── src/
│   ├── app.ts           # Express application setup and route mounting
│   ├── server.ts        # Server entrypoint and DB connection
│   ├── config/          # Environment variables and Mongo connection
│   ├── middleware/      # Auth, rate limiting, validation, error handler
│   ├── modules/         # Domain-driven feature modules
│   │   ├── auth/        # Register, login, me
│   │   ├── project/     # Projects and RBAC membership
│   │   ├── variable/    # Secret masking, diff computation, .env.example
│   │   ├── change/      # Immutable audit trail
│   │   └── alert/       # Webhooks and email dispatches
│   └── shared/          # Utility functions, custom errors, hashing
└── package.json
```

---

## Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `tsx watch src/server.ts` | Start development server with hot-reload |
| `npm run build` | `tsc` | Compile TypeScript to `dist/` |
| `npm run start` | `node dist/src/server.js` | Run compiled production server |
| `npm run typecheck` | `tsc --noEmit` | Validate TypeScript types without output |
| `npm run cli:upload` | `tsx cli/envg-upload.ts` | Run upload CLI in development |
| `npm run cli:sync-example`| `tsx cli/sync-example.ts` | Run example sync CLI in development |

---

## Environment Setup

Create `.env` inside `api/` by copying the example:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port | `4000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/envguard` |
| `JWT_SECRET` | Secret key for signing tokens | (Required in production) |
| `JWT_EXPIRES_IN` | Token validity | `7d` |
| `CORS_ORIGIN` | Allowed web clients | `http://localhost:3000` |
| `PROJECTS_PAGE_LIMIT` | Projects per page | `6` |
| `VARIABLES_PAGE_LIMIT` | Variables per page | `10` |
| `HISTORY_PAGE_LIMIT` | History entries per page | `8` |
| `MEMBERS_PAGE_LIMIT` | Members per page | `5` |
| `ACTIVITY_RETENTION_DAYS` | TTL threshold for change audit logs | `7` |
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | Optional |
| `SMTP_PASS` | SMTP application password | Optional |
| `SMTP_FROM` | Outgoing email header | `EnvGuard <noreply@envguard.local>` |

---

## CLI Commands

The API package includes two CLI binaries configured in `package.json`:

1. **`npx envg-upload`**: Synchronizes a local `.env` file to EnvGuard.
   ```bash
   npx envg-upload --file .env --project <PROJECT_ID> --api http://localhost:4000 --token <JWT>
   ```

2. **`npx envguard-sync-example`**: Downloads the auto-generated blank `.env.example`.
   ```bash
   npx envguard-sync-example --project <PROJECT_ID> --output .env.example --api http://localhost:4000 --token <JWT>
   ```
