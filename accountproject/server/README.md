# Backend API

Express + SQLite backend for the ЛабКонтроль client portal. Replaces the old
in-memory mock (`src/data/store.js`'s `Store` class) with real persistence,
authentication, and server-enforced authorization.

## Running

```bash
npm install
npm start          # http://localhost:4001
```

The SQLite database (`data/app.sqlite`) is created and seeded with demo data
automatically on first run — see `src/seed.js` for the seeded accounts
(same ones documented in the frontend's `README.md`) and demo tour/application
data. Uploaded files are written to `uploads/` and served at `/uploads/<name>`.

Both `data/` and `uploads/` are gitignored — delete `data/app.sqlite*` to reset
to a clean seeded state.

### Environment variables

| Variable     | Default                    | Purpose                          |
|--------------|-----------------------------|-----------------------------------|
| `PORT`       | `4001`                       | HTTP port                         |
| `JWT_SECRET` | `dev-only-secret-change-me`  | Set a real secret in production   |

## Architecture

- `src/db.js` — SQLite connection + schema (users, programs, tours,
  applications, notifications, and their timeline/target join tables).
- `src/seed.js` — one-time demo data seed (idempotent — skipped if the
  `users` table already has rows).
- `src/auth.js` — JWT signing/verification, `requireAuth` / `requireRole`
  middleware.
- `src/repo.js` — all business logic: the application/tour status state
  machine, auto-creating a tour per program when needed, and fan-out
  notifications — ported 1:1 from the original mock's `Store` class, now
  running as real SQL against the database inside transactions.
- `src/routes/*.js` — thin Express routers that authenticate, authorize,
  validate input, and delegate to `repo.js`.
- `src/app.js` — wires up the routes, CORS, JSON body parsing, static
  `/uploads` serving, and (in production) serves the built frontend
  (`../build`) so the whole app can run as one process.

## API surface

All endpoints are under `/api` and (except `/auth/*`) require
`Authorization: Bearer <token>`.

- **Auth**: `POST /auth/register`, `POST /auth/verify-email`,
  `POST /auth/login`, `GET /auth/me`
- **Programs**: `GET /programs`
- **Users**: `GET /users`, `POST /users` (admin — creates an admin/manager
  account with a generated password)
- **Applications**: `GET /applications` (scoped to the caller's role),
  `GET /applications/:id`, `POST /applications` (client submits),
  plus one POST endpoint per lifecycle step (`:id/accept`, `:id/reject`,
  `:id/draft-contract`, `:id/signed-contract`, `:id/samples-received`,
  `:id/protocol`, `:id/processing`, `:id/final-documents`) — each validates
  the application's current status server-side before applying the
  transition.
- **Tours**: `GET /tours`, `GET /tours/:id`, `POST /tours/:id/start`,
  `POST /tours/:id/work-status`, `POST /tours/:id/samples-sent`.
- **Notifications**: `GET /notifications` (mine), `GET /notifications/all`
  (admin only — powers the archive log), `POST /notifications/:id/read`,
  `POST /notifications/read-all`.
- **Uploads**: `POST /uploads` (multipart `file` field) — stores the file on
  disk and returns `{ filename, url }`; `url` is what gets saved on the
  application record and served back at `/uploads/<name>`.

## Notable deviations from the original mock

The original in-memory `Store` trusted the UI entirely (any logged-in user
could, in principle, read or mutate anything — it just never happened
because the UI never called those code paths). Since this is now a real
server, a few real authorization checks were added that weren't previously
enforceable, without changing any observable UI behavior:

- A client can only fetch their own applications (`GET /applications/:id`
  403s for someone else's application); a manager only their assigned
  tours' applications; matches every navigation path the UI already took.
- Every status-changing endpoint re-checks the application/tour's current
  status server-side (e.g. accepting an already-accepted application 409s)
  instead of trusting the client to only show the button once.
