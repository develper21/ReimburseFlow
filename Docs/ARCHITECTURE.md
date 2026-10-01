# 🏛 System Architecture

**ReimburseFlow – Enterprise Expense & Reimbursement Intelligence Platform**

This document describes the overall system architecture, technology stack, folder structure, data flow, and key design decisions for the ReimburseFlow application.

---

## 1. High-Level Architecture

ReimburseFlow follows a full-stack architecture using React (Vite) and Express + MongoDB.

```
┌──────────┐      HTTPS/JSON      ┌─────────────────┐      Mongoose ODM      ┌───────────────┐
│   User   │ ◄──────────────────► │ React Frontend  │ ◄────────────────────► │ Express API   │
│ (Browser)│                      │ (Vite / Client) │                        │ + MongoDB     │
└──────────┘                      └─────────────────┘                        └───────────────┘
```

- **Frontend** runs on Vite dev server (port 5173) and talks to the backend via `VITE_API_URL` (or a `/api` proxy).
- **Backend** runs Express on port 5001 and persists data in MongoDB Atlas via Mongoose.
- **Auth** is stateless JWT (7-day expiry) sent as `Authorization: Bearer <token>`.

## 2. Technology Stack

Technologies used in the project and their purpose:

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18 (Vite) | UI framework & fast dev server |
| Language | JavaScript (ESM) | Type-safe-ish, better developer experience |
| Styling | TailwindCSS | Modern and responsive UI (Appwrite theme) |
| Data Fetching | TanStack React Query | Caching, mutations, invalidation |
| Routing | React Router v6 | Client-side navigation |
| OCR | Tesseract.js | Receipt text extraction in browser |
| Backend | Express 4 (Node.js) | REST API + business logic |
| Database | MongoDB Atlas + Mongoose 8 | Data persistence and schema |
| Auth | JWT + bcryptjs | Token-based authentication |
| Upload | Multer (memory storage) | Receipt upload → Base64 data URI |
| Deployment | Netlify (FE) + Render (BE) | Hosting and deployment |
| Version Control | Git + GitHub | Source code management |

## 3. Folder Structure

The project follows a feature-friendly folder structure to keep the code organized and scalable.

```
reimburseflow/
├── Docs/                    # 📚 Project documentation (PRD, ARCHITECTURE, RULES…)
├── postman/                 # 🧪 Postman collection (frontend-side API base)
│   └── postman.json
├── server/                  # 🖥 Express backend
│   ├── postman/             # 🧪 Postman collection (server-side API base)
│   │   └── postman.json
│   └── src/
│       ├── server.js        # App entry, middleware, route mounting
│       ├── config/          # MongoDB connection (db.js)
│       ├── models/          # Mongoose schemas (User, Expense, ApprovalRule…)
│       ├── routes/          # REST route handlers (auth, expenses, approvals…)
│       ├── middleware/      # JWT protect + role guard
│       ├── utils/           # repo.js data layer, demoData seeding
│       └── .env.example     # Environment template
├── src/                     # ⚛️ React frontend
│   ├── components/
│   │   ├── Admin/           # User management, approval rules, budgets
│   │   ├── Auth/            # Login / SignUp forms
│   │   ├── Employee/        # Expense form, expense list, OCR upload
│   │   ├── Manager/         # Pending approvals, approval modal
│   │   └── Shared/          # Layout, modals, badges
│   ├── hooks/               # React Query hooks (useAuth, useExpenses…)
│   ├── lib/                 # api.js client, constants, currency, ocr
│   ├── pages/               # Route pages (Dashboard, AnalyticsPage…)
│   ├── App.jsx              # Router + providers
│   └── main.jsx             # Entry point
├── index.html               # Vite HTML shell
├── tailwind.config.js       # Appwrite theme tokens
└── package.json             # Scripts & dependencies
```

## 4. Data Flow (Expense Approval)

1. **Employee** uploads receipt → OCR fills amount/merchant → submits `POST /api/expenses` → status `pending`.
2. Backend matches expense against company **ApprovalRule** (`percentage` / `specific` / `hybrid`).
3. **Manager/Admin** fetches `GET /api/approvals/pending` and decides via `POST /api/approvals/process`.
4. Every decision writes an **AuditLog** and updates expense status → `approved` / `rejected`.
5. Finance views results in **Analytics** (`/api/analytics/overview`) and **Audit** (`/api/analytics/audit`).

## 5. Key Design Decisions

- **Repo pattern (`utils/repo.js`)** — single data-access layer so Mongo memory-store and Atlas can be swapped without touching route logic.
- **JWT in localStorage** — simple stateless auth for SPA; token auto-attached by `src/lib/api.js`.
- **Receipts as Base64 data URIs** — avoids external storage dependency (Supabase Storage removed in v2); 10MB Multer limit guards payloads.
- **Role guard middleware** — `requireRole('admin', 'manager')` protects privileged routes in one line.
- **Auto-seeding** — demo company/users/expenses are seeded on boot (`/api/seed` also available) so the console is never empty.

---

*Any new route, model, or page must be reflected here before implementation.*
