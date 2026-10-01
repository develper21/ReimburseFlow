# 🧠 Project Memory

**ReimburseFlow – Context, Progress & Important Notes**

This document keeps track of the current state of the project, important decisions, and things to remember. It helps maintain continuity across development sessions (for AI assistants or new contributors).

---

| 📅 Last Updated | 👤 Current Phase | 🔄 Sprint |
|---|---|---|
| **Oct 1, 2026** | **Phase 4** — Approvals & Rules | Docs + API testing |

---

## 🎯 Current Status

- ✅ Project setup completed (React + Vite, Tailwind, Express)
- ✅ Git repository initialized and pushed to GitHub
- ✅ MongoDB Atlas project created and configured (with in-memory fallback)
- ✅ Authentication (signup, login, demo-login, protected routes) completed
- ✅ Expense submission + OCR + multi-currency flow completed
- 🔄 Working on Approvals & Rules polish (UI in progress)
- ✅ Documentation (Docs/) and Postman collections created

## ✅ Completed Tasks

| # | Task | Completed On |
|---|---|---|
| 1.1 | Initialize React + Vite project | Oct 2, 2025 |
| 1.2 | Configure TailwindCSS Appwrite theme | Oct 4, 2025 |
| 1.3 | Set up Git repository | Oct 5, 2025 |
| 2.1 | Express server + MongoDB connection | Oct 28, 2025 |
| 2.2 | Implement signup page | Sep 24, 2026 |
| 2.3 | Implement login page | Sep 24, 2026 |
| 2.4 | Protect dashboard routes | Sep 28, 2026 |
| 3.1 | Expense model + submission flow | Sep 30, 2026 |

## 🔄 In Progress

| # | Task | Notes |
|---|---|---|
| 4.1 | Admin rule builder UI polish | Percentage/specific/hybrid |
| 4.2 | Sequential approval ordering | `sequenceOrder` flag in rule model |

## ⏭ Next Up

| # | Task | Target |
|---|---|---|
| 5.1 | CSV/JSON export UI wiring | `/api/expenses/export` |
| 5.2 | Playwright E2E smoke tests | Login → submit → approve |
| 5.3 | Email notification digests | Post-MVP |

## 🗝 Important Notes & Decisions

- **Backend port is 5001** (not 5000). Frontend dev server runs on 5173.
- **Auth** = JWT in `localStorage` under key `reimburseflow_token`; attached as `Bearer` by `src/lib/api.js`.
- **All API responses** follow `{ success, message?, count?, data }` — keep it consistent.
- **Receipts** are stored as Base64 data URIs (no Supabase/S3 in v2). Max upload 10MB, JPEG/PNG/WebP/PDF only.
- **Data layer** = `server/src/utils/repo.js` — routes must never touch Mongoose directly.
- **Demo seeding** runs automatically on server boot; manual trigger via `POST /api/seed`.
- Demo credentials after seeding: `admin@reimburseflow.com`, `manager@reimburseflow.com`, `employee@reimburseflow.com` (password: `password123`).
- **Postman collections live in two folders**: root `postman/` (frontend base URL style, `/api` proxy) and `server/postman/` (direct `http://localhost:5001` base URL). Update both when routes change.
- **Deployments**: Frontend → Netlify, Backend → Render (see `netlify.toml`, `render.yaml`).

---

*Update this file at the end of every development session.*
