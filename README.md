# SecureVote — Digital Voting & Election Management Platform

> *"Your voice. Your choice. Your future."*

SecureVote is a civic-technology hackathon prototype demonstrating how a digital election management platform can organize elections, candidate dossiers, voter participation flows, administrative oversight, and transparent result visualization.

---

## Prototype Disclaimer & Security Boundaries

**IMPORTANT:** This application is a **hackathon prototype** using simulated election data.
- It **does not** claim to provide end-to-end verifiable elections (e.g., Benaloh challenges or zero-knowledge ballot proofs), coercion-resistant anonymity, or tamper-proof statutory ballots.
- It **must not** be used for real-world or binding public elections without independent cryptographic verification, third-party security audits, formal threat modeling, hardware key custody (HSM), and authoritative voter identity proofing.

---

## Architecture Overview

```text
securevote/
├── .env.example                 # Environment configuration template
├── README.md                    # Documentation & setup guide
├── backend/                     # FastAPI + SQLAlchemy + Alembic + SQLite/PostgreSQL
│   ├── alembic/                 # Database schema migrations
│   ├── app/
│   │   ├── main.py              # FastAPI application entrypoint & lifespan seeding
│   │   ├── config.py            # Pydantic environment settings
│   │   ├── database.py          # SQLAlchemy engine & session management
│   │   ├── dependencies.py      # Cookie session, CSRF, & RBAC dependencies
│   │   ├── middleware/          # Auth rate limiter & HTTP security headers
│   │   ├── models/              # User, UserSession, Election, Candidate, DemoBallot, Locks, Audit
│   │   ├── schemas/             # Pydantic v2 validation schemas
│   │   ├── services/            # Modular business logic & seed service
│   │   ├── routers/             # Modular REST API routers
│   │   └── utils/               # Argon2id password hashing, HMAC tokens, CSRF helpers
│   └── tests/                   # Automated pytest security, RBAC, and voting tests
└── frontend/                    # React + TypeScript + Vite + Tailwind + Framer Motion
    └── src/
        ├── animations/          # Reduced-motion-safe Framer Motion variants
        ├── components/          # Reusable UI primitives, modals, SVG hero ledger
        ├── context/             # AuthContext & ToastContext
        ├── hooks/               # Live election countdown hook
        ├── layouts/             # Editorial MainLayout & AdminLayout
        ├── pages/               # Public, Voter, Voting Booth, Results, Transparency, Admin
        ├── routes/              # Protected & role-guarded React Router routes
        ├── services/            # Fetch client with automatic CSRF header injection
        ├── types/               # TypeScript domain contracts
        └── utils/               # Formatting & initials helpers
```

### Privacy-Separating Data Model (Prototype)

To avoid storing personally identifying voter data alongside individual ballot choices:
- **`demo_ballots`** stores only `(id, election_id, candidate_id, submission_timestamp, demo_session_ref)` with zero `user_id` or email columns.
- **`voter_participation_locks`** stores only `(id, election_id, user_id, participated_at)` with a unique `(election_id, user_id)` constraint to prevent repeated demo submissions, without any foreign key or reference to `demo_ballots` or `candidate_id`.
- **`election_audit_events`** stores strictly non-sensitive metadata summaries.

---

## Demo Credentials

Pre-seeded accounts (also available via one-click quick-fill buttons on `/login`):

| Role | Name | Email | Voter ID | Password |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Voter** | Maya Lin | `voter@securevote.demo` | `VID-2026-1001` | `DemoVoter2026!` |
| **Demo Voter** | Alex Rivera | `alex.rivera@securevote.demo` | `VID-2026-1002` | `DemoVoter2026!` |
| **Demo Admin** | Elena Vance | `admin@securevote.demo` | `ADM-2026-0001` | `DemoAdmin2026!` |

---

## Setup & Installation Instructions

### Quick Launch (Windows PowerShell)

Start both the FastAPI backend (`:8001`) and Vite frontend (`:5173`) in one command:

```powershell
.\dev.ps1
```

### 1. Environment Configuration

Copy `.env.example` to `.env` at the repository root if you wish to customize secrets or switch from SQLite to PostgreSQL:

```bash
cp .env.example .env
```

- **Database Fallback**: Defaults to `sqlite:///./securevote.db` for local development.
- **PostgreSQL**: Set `DATABASE_URL=postgresql+psycopg://user:password@localhost:5432/securevote` (and install `psycopg[binary]`).

### 2. Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv

# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt

# Apply database migrations (optional — FastAPI also initializes & seeds on startup)
alembic upgrade head

# Start the API server on port 8001
uvicorn app.main:app --reload --port 8001
```

Interactive OpenAPI / Swagger documentation is automatically available at:
- `http://127.0.0.1:8001/docs`
- `http://127.0.0.1:8001/redoc`

### 3. Frontend Setup (React + Vite)

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server runs at `http://localhost:5173` and proxies `/api/*` requests to `http://127.0.0.1:8001`.

---

## Testing Instructions

Run the automated backend security, RBAC, and voting test suite:

```bash
cd backend
.\.venv\Scripts\pytest.exe -v
```

Verify frontend TypeScript compilation and production bundling:

```bash
cd frontend
npm run build
```

---

## Push to GitHub & Public Deployment

### 1. Push to GitHub

From the project root (`securevote/`):

```bash
git init
git add .
git commit -m "Initial commit: SecureVote digital voting prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/securevote.git
git push -u origin main
```

### 2. Deploy Publicly (Easiest: Render or Railway via `Dockerfile` / `render.yaml`)

This repository includes a unified multi-stage `Dockerfile` and `render.yaml` that build the React frontend and serve both the UI and FastAPI API from a single public URL (avoiding cross-domain cookie issues):

1. Push the repository to GitHub.
2. On **Render** (`https://render.com`), choose **New + -> Blueprint** (or **Web Service -> Docker**) and connect your GitHub repo.
3. Render automatically provisions `SECRET_KEY`, sets `COOKIE_SECURE=true` and `SERVE_SPA=true`, builds the Docker image, and gives you a live `https://...onrender.com` URL.
4. For persistent production-style data on Render/Railway, attach a managed **PostgreSQL** database and set `DATABASE_URL` (plus add `psycopg[binary]` to `backend/requirements.txt`).

### 3. Split Deployment (Vercel Frontend + Render/Railway Backend)

- **Backend:** Deploy `backend/` to Render/Railway and set `BACKEND_CORS_ORIGINS=https://your-app.vercel.app`, `COOKIE_SECURE=true`, `COOKIE_SAMESITE=none`.
- **Frontend:** Deploy `frontend/` to Vercel (uses `frontend/vercel.json` for SPA routing) and set environment variable `VITE_API_BASE_URL=https://your-api.onrender.com/api`.

---

## API Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public (Rate-limited) | Authenticates user, sets HttpOnly session & CSRF cookies |
| `POST` | `/api/auth/register` | Public (Rate-limited) | Registers a new demo `voter` account |
| `POST` | `/api/auth/logout` | Authenticated + CSRF | Revokes session & clears cookies |
| `GET` | `/api/auth/me` | Authenticated | Returns active user & CSRF token |
| `GET` | `/api/elections` | Public | Lists non-draft elections with search & status filters |
| `GET` | `/api/elections/{id}` | Public | Returns election details & candidate lineup |
| `GET` | `/api/candidates` | Public | Lists candidate dossiers with filters |
| `GET` | `/api/voting/eligibility/{id}` | Authenticated | Checks demo eligibility & prior participation |
| `POST` | `/api/voting/submit` | Authenticated + CSRF | Records unlinked demo ballot & participation lock |
| `GET` | `/api/results/overview` | Public | Aggregate simulated platform statistics |
| `GET` | `/api/results/{id}` | Public | Simulated candidate tallies & participation curve |
| `GET` | `/api/transparency` | Public | Non-sensitive audit summaries & security gap notes |
| `GET/POST/PATCH/DELETE` | `/api/admin/*` | Admin Role + CSRF | Full election, candidate, user, and audit log management |
