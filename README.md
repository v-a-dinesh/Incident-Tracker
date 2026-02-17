# 🚨 Incident Tracker — Full-Stack Mini App

A production-grade incident management application for creating, browsing, filtering, sorting, and editing incidents in real time. Built as a full-stack screening assignment with **React + Vite** on the frontend and **Node.js + Express + SQLite** on the backend.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Setup & Run Instructions](#-setup--run-instructions)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Frontend Architecture](#-frontend-architecture)
- [Design Decisions & Tradeoffs](#-design-decisions--tradeoffs)
- [Screenshots](#-screenshots)
- [Improvements with More Time](#-improvements-with-more-time)

---

## ✨ Features

### Core Functionality

- **Create Incidents** — Log new incidents with title, service, severity (SEV1–SEV4), status (Open/Mitigated/Resolved), owner, and summary
- **Browse Incidents** — Paginated list view displaying 10 incidents per page with full metadata
- **View Incident Details** — Detailed view with all incident fields in a clean label-value layout
- **Edit Incidents** — Inline editing of severity, status, service, owner, and summary with save/cancel actions

### Filtering & Search

- **Severity Checkboxes** — Toggle SEV1, SEV2, SEV3, SEV4 independently (multi-select)
- **Status Dropdown** — Filter by Open, Mitigated, or Resolved
- **Service Dropdown** — Filter by affected service (Auth, Payments, Backend, Frontend, Database, etc.)
- **Text Search** — Debounced (300ms) full-text search across title, service, and owner fields
- **Combined Filters** — All filters work together with AND logic

### Sorting

- **Sortable Columns** — Click column headers to sort by Title, Severity, or Created At
- **Toggle Direction** — Click again to toggle ascending/descending
- **Custom Severity Sort** — Severity sorts by logical order (SEV1 → SEV4) using SQL CASE expression, not alphabetically

### Pagination

- **Server-Side Pagination** — Only the current page is fetched per request (10 items/page)
- **Page Navigation** — First, Previous, numbered pages, Next, Last buttons
- **Ellipsis** — Smart ellipsis (…) for large page ranges
- **Page Info** — Shows "Page X of Y" at all times

### UX Enhancements

- **Loading Spinner** — Visual feedback during API fetches
- **Empty State** — Clear messaging when no results match filters
- **Error Handling** — Inline error messages for API failures
- **Toast Notifications** — Slide-in confirmation on successful save/create
- **Responsive Design** — Adapts to mobile and tablet viewports
- **Client-Side Routing** — React Router for seamless navigation without full page reloads

### Data

- **200 Seeded Incidents** — Pre-populated with realistic randomized data covering all severity levels, statuses, and services

---

## 🛠 Tech Stack

| Layer     | Technology            | Version | Purpose                                     |
| --------- | --------------------- | ------- | ------------------------------------------- |
| Runtime   | Node.js               | 18+     | Server-side JavaScript runtime              |
| Backend   | Express               | 4.21    | REST API framework                          |
| Database  | SQLite                | 3       | Embedded relational database                |
| DB Driver | better-sqlite3        | 11.7    | Synchronous, high-performance SQLite driver |
| IDs       | uuid                  | 10.0    | UUID v4 primary key generation              |
| CORS      | cors                  | 2.8     | Cross-origin request handling               |
| Frontend  | React                 | 18.3    | UI component library                        |
| Routing   | React Router          | 6.28    | Client-side routing                         |
| Bundler   | Vite                  | 6.0     | Dev server with HMR + production bundler    |
| Styling   | CSS Custom Properties | —       | Theming and responsive design               |

---

## 📂 Project Structure

```
Zeotap/
├── README.md
├── backend/
│   ├── package.json            # Backend dependencies & scripts
│   ├── server.js               # Express app setup, middleware, error handling
│   ├── database.js             # SQLite connection, schema creation, indexes
│   ├── seed.js                 # Seeds 200 randomized incidents
│   ├── incidents.db            # SQLite database file (auto-created)
│   └── routes/
│       └── incidents.js        # All 4 REST endpoints (POST, GET list, GET by id, PATCH)
│
└── frontend/
    ├── package.json            # Frontend dependencies & scripts
    ├── vite.config.js          # Vite config with API proxy to backend
    ├── index.html              # HTML entry point
    └── src/
        ├── main.jsx            # React root with BrowserRouter
        ├── App.jsx             # Route definitions (List, Detail, Create)
        ├── index.css           # Complete stylesheet with CSS custom properties
        ├── api.js              # API client (fetch wrapper for all endpoints)
        ├── hooks.js            # Custom hooks: useDebounce, useFetch
        ├── utils.jsx           # Constants, formatters, badge class helpers
        └── pages/
            ├── IncidentList.jsx    # List view with filters, table, pagination
            ├── IncidentDetail.jsx  # Detail view with inline editing
            └── CreateIncident.jsx  # Create form with validation
```

---

## 🚀 Setup & Run Instructions

### Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **npm** v9+ (bundled with Node.js)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd Zeotap
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run seed        # Populates the database with 200 sample incidents
npm start           # Starts API server on http://localhost:5000
```

### 3. Start the Frontend

Open a **second terminal**:

```bash
cd frontend
npm install
npm run dev         # Starts dev server on http://localhost:3000
```

### 4. Open the App

Navigate to **http://localhost:3000** in your browser.

> **Note:** The frontend proxies all `/api` requests to `http://localhost:5000` automatically via Vite's proxy configuration.

### Quick Start (Copy-Paste)

```bash
# Terminal 1
cd backend && npm install && npm run seed && npm start

# Terminal 2
cd frontend && npm install && npm run dev
```

---

## 🗄 Database Schema

```sql
CREATE TABLE incidents (
  id          TEXT PRIMARY KEY,                        -- UUID v4
  title       TEXT NOT NULL,                           -- Incident title
  service     TEXT NOT NULL,                           -- Affected service name
  severity    TEXT NOT NULL CHECK(severity IN ('SEV1','SEV2','SEV3','SEV4')),
  status      TEXT NOT NULL CHECK(status IN ('OPEN','MITIGATED','RESOLVED')),
  owner       TEXT,                                    -- Assigned person (optional)
  summary     TEXT,                                    -- Detailed description (optional)
  created_at  TEXT NOT NULL DEFAULT (datetime('now')), -- ISO timestamp
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))  -- ISO timestamp
);
```

### Indexes

| Index Name                 | Column       | Purpose                       |
| -------------------------- | ------------ | ----------------------------- |
| `idx_incidents_severity`   | `severity`   | Fast severity filter queries  |
| `idx_incidents_status`     | `status`     | Fast status filter queries    |
| `idx_incidents_service`    | `service`    | Fast service filter queries   |
| `idx_incidents_created_at` | `created_at` | Fast date sorting             |
| `idx_incidents_title`      | `title`      | Fast title sorting and search |

### Configuration

- **WAL Mode** — Write-Ahead Logging for better concurrent read performance
- **Foreign Keys** — Enabled via pragma for data integrity

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

### Health Check

```
GET /api/health
```

Response:

```json
{ "status": "ok", "timestamp": "2024-12-30T10:00:00.000Z" }
```

---

### 1. Create Incident

```
POST /api/incidents
Content-Type: application/json
```

**Request Body (required fields marked with \*):**

| Field      | Type   | Required | Description                             |
| ---------- | ------ | -------- | --------------------------------------- |
| `title`    | string | ✅       | Incident title                          |
| `service`  | string | ✅       | Affected service name                   |
| `severity` | string | ✅       | One of: `SEV1`, `SEV2`, `SEV3`, `SEV4`  |
| `status`   | string | ✅       | One of: `OPEN`, `MITIGATED`, `RESOLVED` |
| `owner`    | string | ❌       | Person assigned to the incident         |
| `summary`  | string | ❌       | Detailed description                    |

**Example:**

```bash
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Timeout",
    "service": "Backend",
    "severity": "SEV1",
    "status": "OPEN",
    "owner": "dev@team.com",
    "summary": "API requests to the backend service were timing out."
  }'
```

**Response:** `201 Created` — Returns the full incident object with generated `id`, `created_at`, `updated_at`.

**Error Response:** `400 Bad Request`

```json
{ "errors": ["Title is required and must be a non-empty string."] }
```

---

### 2. List Incidents (Paginated)

```
GET /api/incidents
```

**Query Parameters:**

| Param      | Type   | Default      | Description                                      |
| ---------- | ------ | ------------ | ------------------------------------------------ |
| `page`     | int    | `1`          | Page number (1-indexed)                          |
| `limit`    | int    | `10`         | Items per page (max: 100)                        |
| `search`   | string | —            | Search across title, service, owner (LIKE match) |
| `severity` | string | —            | Comma-separated: `SEV1,SEV2`                     |
| `status`   | string | —            | Comma-separated: `OPEN,RESOLVED`                 |
| `service`  | string | —            | Exact service name match                         |
| `sortBy`   | string | `created_at` | Sort field (see table below)                     |
| `order`    | string | `desc`       | Sort direction: `asc` or `desc`                  |

**Valid `sortBy` values:** `title`, `severity`, `status`, `service`, `created_at`, `updated_at`, `owner`

**Example:**

```bash
curl "http://localhost:5000/api/incidents?page=1&limit=5&severity=SEV1,SEV2&status=OPEN&sortBy=created_at&order=desc"
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "API Timeout",
      "service": "Backend",
      "severity": "SEV1",
      "status": "OPEN",
      "owner": "dev@team.com",
      "summary": "API requests timing out under load.",
      "created_at": "2024-12-30 02:09:28",
      "updated_at": "2024-12-30 02:09:28"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 42,
    "totalPages": 9
  }
}
```

---

### 3. Get Incident by ID

```
GET /api/incidents/:id
```

**Example:**

```bash
curl http://localhost:5000/api/incidents/550e8400-e29b-41d4-a716-446655440000
```

**Response:** `200 OK` — Full incident object.

**Error:** `404 Not Found`

```json
{ "error": "Incident not found." }
```

---

### 4. Update Incident (Partial)

```
PATCH /api/incidents/:id
Content-Type: application/json
```

Accepts any combination of: `title`, `service`, `severity`, `status`, `owner`, `summary`. Only included fields are updated. `updated_at` is set automatically.

**Example:**

```bash
curl -X PATCH http://localhost:5000/api/incidents/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "RESOLVED", "summary": "Issue resolved after DB migration."}'
```

**Response:** `200 OK` — Returns the full updated incident object.

**Error:** `400 Bad Request` (validation) or `404 Not Found`

---

## 🖥 Frontend Architecture

### Pages

| Page               | Route            | Description                                    |
| ------------------ | ---------------- | ---------------------------------------------- |
| **IncidentList**   | `/`              | Main dashboard with filters, table, pagination |
| **IncidentDetail** | `/incidents/:id` | View/edit a single incident                    |
| **CreateIncident** | `/incidents/new` | Form to create a new incident                  |

### Key Modules

| File        | Purpose                                                         |
| ----------- | --------------------------------------------------------------- |
| `api.js`    | Fetch wrapper with error handling for all 4 API endpoints       |
| `hooks.js`  | `useDebounce(value, 300ms)` — delays search API calls           |
|             | `useFetch(fetchFn, deps)` — data/loading/error state management |
| `utils.jsx` | Constants (`SEVERITIES`, `STATUSES`, `SERVICES`)                |
|             | Date formatters (`formatDate`, `formatDateTime`)                |
|             | Badge CSS class helpers (`severityClass`, `statusClass`)        |
| `index.css` | Complete design system using CSS custom properties              |

### State Management

- **No external state library** — React `useState` + `useMemo` + `useCallback` hooks
- **Server as source of truth** — All data lives in the API; the frontend is a thin presentation layer
- **URL-driven filters** — Filter/sort/page state is managed locally and sent as query parameters

### API Proxy

Vite's dev server proxies `/api/*` requests to `http://localhost:5000`:

```js
// vite.config.js
server: {
  port: 3000,
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true }
  }
}
```

---

## 🎨 Design Decisions & Tradeoffs

### Backend Decisions

| Decision                         | Reasoning                                                                                     |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| **SQLite**                       | Zero-config, single-file DB — perfect for a portable assignment. No external DB setup needed. |
| **better-sqlite3 (synchronous)** | Sub-millisecond local file ops make sync acceptable. 2-5x faster than async alternatives.     |
| **UUID primary keys**            | Avoid auto-increment leakage; support distributed ID generation if needed.                    |
| **Parameterized queries**        | All user inputs go through prepared statements — prevents SQL injection by design.            |
| **5 database indexes**           | Optimizes common filter/sort paths (severity, status, service, created_at, title).            |
| **CASE-based severity sort**     | `SEV1 > SEV2 > SEV3 > SEV4` logical ordering instead of alphabetical.                         |
| **Server-side pagination**       | Only fetches 10 rows per request — scalable to millions of records.                           |
| **Validation on server**         | Never trust the client — all inputs validated with descriptive error arrays.                  |
| **WAL journal mode**             | Better concurrent read performance for SQLite.                                                |

### Frontend Decisions

| Decision                  | Reasoning                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------- |
| **React + Vite**          | Lightweight, instant HMR, modern tooling, minimal boilerplate.                        |
| **Plain CSS**             | No UI library dependency — keeps bundle small, avoids version churn.                  |
| **CSS Custom Properties** | Centralized theming (colors, radii, shadows) — easy to maintain and modify.           |
| **Debounced search**      | 300ms delay prevents firing API calls on every keystroke.                             |
| **Custom hooks**          | `useDebounce` and `useFetch` extract reusable logic from components.                  |
| **No state library**      | React's built-in state is sufficient — adding Redux/Zustand would be overengineering. |
| **React Router v6**       | Client-side navigation without full page reloads.                                     |

### Tradeoffs

| Tradeoff                  | Status    | Reasoning                                            |
| ------------------------- | --------- | ---------------------------------------------------- |
| **No TypeScript**         | Conscious | Faster development; TS would improve safety at scale |
| **No authentication**     | Conscious | Out of scope; essential for production               |
| **No automated tests**    | Conscious | Time constraint; would add Jest + RTL + Supertest    |
| **SQLite (not Postgres)** | Conscious | Portability over concurrency for this assignment     |
| **No Docker**             | Conscious | Simplicity; Docker-compose would ease team setup     |

---

## 📸 Screenshots

### Incident List

- Sticky header with "Incident Tracker" title and "+ New Incident" button
- Filter bar: Service dropdown, SEV1–SEV4 checkboxes, Status dropdown, Search input
- Sortable table with color-coded severity and status badges
- Pagination bar: `Page 1 of 20  «  ‹ Prev  1  2  3  4  5 … 20  Next ›  »`

### Incident Detail

- Label-value grid layout: Service, Severity, Status, Assigned To, Occurred At, Summary
- Inline edit mode with dropdowns and text inputs
- Toast notification on successful save

### Create Incident

- Form with Title, Service dropdown, Severity radio buttons, Status dropdown, Assigned To, Summary
- Client-side validation with inline error messages
- Toast notification and redirect on successful creation

---

## 🔮 Improvements with More Time

| Priority | Improvement            | Description                                                |
| -------- | ---------------------- | ---------------------------------------------------------- |
| 🔴 High  | **TypeScript**         | Full type safety across frontend and backend               |
| 🔴 High  | **Testing**            | Jest unit tests, Supertest API tests, Playwright E2E tests |
| 🔴 High  | **Authentication**     | JWT-based auth with role-based access control              |
| 🟡 Med   | **PostgreSQL**         | Replace SQLite for production concurrency and scalability  |
| 🟡 Med   | **Docker**             | `docker-compose up` for one-command full-stack setup       |
| 🟡 Med   | **CI/CD**              | GitHub Actions: lint → test → build → deploy pipeline      |
| 🟡 Med   | **URL-synced filters** | Sync filter/sort/page state with URL query params          |
| 🟢 Low   | **Real-time updates**  | WebSocket/SSE for live incident status changes             |
| 🟢 Low   | **Audit log**          | Track all changes with timestamps and user attribution     |
| 🟢 Low   | **Notifications**      | Email/Slack alerts for SEV1/SEV2 incidents                 |
| 🟢 Low   | **Dark mode**          | Theme toggle using existing CSS custom properties          |
| 🟢 Low   | **Accessibility**      | ARIA labels, keyboard navigation, screen reader support    |
| 🟢 Low   | **Rate limiting**      | API rate limiting to prevent abuse                         |
| 🟢 Low   | **Export**             | CSV/JSON export of filtered incident data                  |

---

## 📜 License

This project was built as a screening assignment. Not licensed for redistribution.
