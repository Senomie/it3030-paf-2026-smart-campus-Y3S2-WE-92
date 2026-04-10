# Smart Campus (PAF) — IT3030/IT3010 Assignment

This repository contains a **Smart Campus Operations Hub** full‑stack web application (as per **IT3030 PAF Assignment 2026**) split into:

- **Frontend**: React + Vite (SPA)
- **Backend**: Spring Boot (Maven) with Security, JWT, OAuth2 Client, JPA (MySQL)

---

### Contents

- **Project structure**
- **Prerequisites**
- **Run locally (backend + frontend)**
- **Configuration (DB, ports, auth)**
- **Key frontend architecture**
- **CI workflow**
- **Screenshots**
- **Troubleshooting**

---

### Project structure

```
backend/                  # Spring Boot backend (Maven)
frontend/                 # React + Vite frontend
docs/images/              # UI screenshots used in documentation
.github/workflows/        # GitHub Actions CI
.vscode/                  # Workspace/editor settings (optional)
thumbnail.png             # Project thumbnail
README.md                 # This README
```

---

### Assignment modules coverage (minimum requirements)

The assignment requires implementing the following minimum modules. This repo is structured to support them:

- **Module A — Facilities & Assets Catalogue**
  - Resource catalogue (rooms/labs/equipment), metadata, availability, status (ACTIVE / OUT_OF_SERVICE), search & filter
- **Module B — Booking Management**
  - Booking request + workflow (PENDING → APPROVED/REJECTED → CANCELLED), conflict prevention, admin review
- **Module C — Maintenance & Incident Ticketing**
  - Tickets with workflow (OPEN → IN_PROGRESS → RESOLVED → CLOSED; optional REJECTED), assignment, comments, up to 3 image attachments
- **Module D — Notifications**
  - Notifications for booking decisions, ticket status changes, and comments; accessible in the UI
- **Module E — Authentication & Authorization**
  - OAuth2 login (Google), roles (USER, ADMIN; optional TECHNICIAN), backend endpoint protection + protected frontend routes

> Tip for viva readiness: keep your commit history and endpoint ownership clear per member, as required by the brief.

### Member 4 — suggested daily commits (10–16 April 2026)

**How to use this:** On each day, do the row whose **date matches the calendar**, commit with the suggested subject (or split into smaller commits). Do **not** commit `backend/src/main/resources/application.properties` if it holds real secrets; use `application.example.properties` + environment variables instead.

| Date | Focus (Notifications + OAuth / roles) | Suggested commit subject |
|------|----------------------------------------|---------------------------|
| **Thu 10 Apr** | OAuth2 (Google), JWT for `/api/**`, CORS, user sync, `/api/auth/me` | `feat(auth): Google OAuth2, JWT API auth, and current-user endpoint` |
| **Fri 11 Apr** | Set `app.security.admin-emails` / `app.security.technician-emails` in local config; exercise `PUT /api/admin/users/{id}/role`; document in report | `feat(auth): role bootstrap from config and admin user role endpoint` |
| **Sat 12 Apr** | Tighten RBAC (`@PreAuthorize`), error responses | `feat(auth): RBAC on admin/booking/ticket endpoints and API errors` |
| **Sun 13 Apr** | Notification entity + list/mark-read/delete APIs | `feat(notifications): persistence and REST API for user notifications` |
| **Mon 14 Apr** | Notifications on booking approve/reject | `feat(notifications): notify users on booking decisions` |
| **Tue 15 Apr** | Notifications on ticket status + comments | `feat(notifications): notify on ticket updates and new comments` |
| **Wed 16 Apr** | Frontend: login redirect, `/login/success`, notifications panel, route guards | `feat(ui): OAuth callback handling and notification panel` |

**Today (quick pick):**

- **10 Apr →** Finish & push **auth slice**: OAuth2 + JWT + `User` + `GET /api/auth/me` + `application.example.properties` + H2 test config. Run `backend` tests before pushing.
- **11 Apr →** **Roles:** configure comma-separated emails in local `application.properties`, log in once to verify `ADMIN` / `TECHNICIAN`, test admin **role update** API; update README/report with who is admin.
- **12 Apr →** Review `@PreAuthorize` on admin/booking/ticket routes; extend `GlobalExceptionHandler` if needed; re-run tests.

If you already implemented several days in one go, either **split into multiple commits** (interactive staging) or make **one honest commit** and use the table in your report to map what you built when.

### Prerequisites

- **Node.js**: 20+ recommended (CI uses Node 20)
- **Java**: JDK **25** (backend `pom.xml` + CI use Java 25)
- **Maven**: not required if you use the included Maven Wrapper (`mvnw` / `mvnw.cmd`)
- **MySQL**: a running MySQL instance (see DB config below)

---

### Run locally

#### Backend (Spring Boot)

From repo root:

```bash
cd backend
./mvnw clean install
./mvnw spring-boot:run
```

On Windows PowerShell (if needed):

```powershell
cd backend
.\mvnw.cmd clean install
.\mvnw.cmd spring-boot:run
```

Expected backend port (from `application.properties`): **8080**

#### Frontend (React + Vite)

From repo root:

```bash
cd frontend
npm install
npm run dev
```

Optional: copy `frontend/.env.example` to `.env.local` and set `VITE_API_ORIGIN` if the API is not on `http://localhost:8080`.

Vite will print the local URL (commonly `http://localhost:5173`). Google sign-in redirects to `{VITE_API_ORIGIN}/oauth2/authorization/google`; after login the backend redirects to `/login/success?token=…` on this dev server.

---

### Configuration

#### Backend: Database + port

Backend config is in:

- `backend/src/main/resources/application.properties`

Current defaults:

- **MySQL URL**: `jdbc:mysql://localhost:3308/smart_campus`
- **Username**: `root`
- **Password**: `root`
- **Server port**: `8080`
- **Hibernate ddl-auto**: `update`

Make sure:

- MySQL is running on **port 3308** (or change it to 3306 if that’s what you use)
- The database `smart_campus` exists (or allow your setup to create it)

#### Backend: JWT

`application.properties` includes:

- `application.security.jwt.secret-key`
- `application.security.jwt.expiration`

These values should be treated as **development defaults** only. For real deployments, use environment-specific secrets.

#### Backend: Google OAuth2

The backend is configured for Google OAuth2 Client and reads values via environment variables with defaults:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

If you’re running OAuth locally, set these environment variables in your shell or IDE run configuration.

#### Frontend: API base URL

Axios is configured here:

- `frontend/src/api/axiosConfig.js`

Current base URL:

- `http://localhost:8080/api`

JWT handling:

- The frontend stores the token in `localStorage` under `jwt_token`
- Requests automatically attach `Authorization: Bearer <token>`

---

### Key frontend architecture (current code)

Even though page components are missing in this snapshot, the existing frontend wiring shows intended behavior:

- **Routing**: `react-router-dom` with a `PrivateRoute` wrapper in `src/App.jsx`
- **Auth state**: `src/context/AuthContext.jsx`
  - Fetches user profile from `GET /auth/me` when a JWT exists
  - Exposes `login(token)` and `logout()`
- **Toasts/notifications**: `src/context/NotificationContext.jsx` + `src/components/Toast.jsx`
  - Provides `showNotification(message, type)`
- **Navbar behavior**: `src/components/Navbar.jsx`
  - Hidden when not authenticated
  - Polls notifications every 10 seconds from `GET /notifications/user/{userId}`
  - Shows unread badge and plays a sound for staff roles when unread count increases

---

### CI workflow

GitHub Actions workflow:

- `.github/workflows/ci.yml`

It runs:

- **Backend**: `./mvnw clean install` (Java 25)
- **Frontend**: `npm install` then `npm run build` (Node 20)

---

### Screenshots

All screenshots are under `docs/images/`.

Example screens:

- Login  
  `docs/images/login-page.png`
- Admin dashboard  
  `docs/images/admin-dashboard.png`
- User dashboard  
  `docs/images/user-dashaboard.png`
- Catalogue  
  `docs/images/user-catalogue-page.png`
- Notifications  
  `docs/images/user-notification-page.png`

---

### Submission notes (from assignment brief)

- **Repository name** should follow: `it3030-paf-2026-smart-campus-groupXX`
- **Report file name** should follow: `IT3030_PAF_Assignment_2026_GroupXX.pdf`
- Do **not** include compiled artifacts in a submission zip (e.g., `node_modules/`, `target/`)

---

### Troubleshooting

- **Backend won’t start / “main class not found”**
  - The backend source under `backend/src/main/java` is missing in this snapshot. Add it (or ensure it’s included) and retry.

- **Frontend fails with “Cannot resolve ./pages/…”**
  - Add the missing page components under `frontend/src/pages/` or update `src/App.jsx` routes/imports.

- **DB connection errors**
  - Ensure MySQL is running and accessible at `localhost:3308`
  - Verify DB name `smart_campus`, user `root`, password `root`
  - Update `application.properties` to match your local MySQL config

- **401 Unauthorized from API**
  - Ensure backend issues a valid JWT and frontend has `jwt_token` in `localStorage`
  - Confirm Axios base URL matches backend port and `/api` prefix