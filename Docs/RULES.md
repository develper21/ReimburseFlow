# 📜 Development Rules

**ReimburseFlow – Project Guidelines for AI & Human Collaborators**

This document defines the development rules, coding standards, and best practices for the ReimburseFlow application. These rules ensure consistency, maintainability, security, and quality across the codebase. Both AI assistants and human contributors must follow these guidelines.

---

## 1️⃣ General Principles

These rules apply to the entire project.

- ✅ Follow the project documentation (PRD, ARCHITECTURE, DESIGN) before making changes.
- ✅ Keep the code clean, readable and well-structured.
- ✅ Prioritize simplicity and maintainability.
- ✅ Do not duplicate logic. Reuse existing components, utilities or services.
- ✅ Make small, focused changes instead of large, risky edits.
- ✅ Do not modify unrelated files.
- ✅ Write self-explanatory code with meaningful variable and function names.
- ✅ Update Docs/ and the Postman collections whenever an API route changes.

## 2️⃣ Technology & Coding Standards

Rules related to the tech stack and coding style:

| Topic | Rule |
|---|---|
| 🟦 Language | Use JavaScript ESM (`import/export`). Avoid CommonJS unless absolutely necessary. |
| ⚛️ Framework | Follow React 18 + Vite best practices; keep `server/` on Express 4 conventions. |
| 🎨 Styling | Use TailwindCSS and follow the design system in DESIGN.md (`aw-*` tokens). |
| 🧹 Linting | Follow ESLint config in `.eslintrc.cjs`; no unused variables or console spam in production code. |
| 📐 Formatting | Use Prettier (`.prettierrc`) — 2-space indent, single quotes, no semicolons (match existing style). |
| 📦 Dependencies | Use stable, well-maintained packages. Do not add a dependency without removing an equivalent one. |
| 🗄 Database | Always go through `server/src/utils/repo.js`; never query Mongoose models directly from routes. |
| 📁 File Naming | Use clear names: React components `PascalCase.jsx`, hooks `useX.jsx`, routes `x.routes.js`. |

## 3️⃣ Project Structure

Follow the defined folder structure in ARCHITECTURE.md to keep the project organized:

- ✅ Place reusable UI components in `/src/components` (grouped by role: Admin, Manager, Employee, Shared).
- ✅ Feature-specific pages belong in `/src/pages`; data-fetching logic lives in `/src/hooks`.
- ✅ Database and external service logic stay inside `/server/src` (models, config, utils).
- ✅ Common utilities should be in `/src/lib` (frontend) or `/server/src/utils` (backend) only.
- ✅ Types of shared constants (categories, roles, statuses) belong in `src/lib/constants.js`.
- ✅ Do not create new folders without a clear purpose and a matching entry in ARCHITECTURE.md.

## 4️⃣ API & Security Rules

- ✅ Every protected route must pass through the `protect` middleware; privileged routes add `requireRole(...)`.
- ✅ Never commit `.env` files or JWT secrets; use `.env.example` templates.
- ✅ Validate all request bodies; return `{ success: false, message }` with proper HTTP status codes.
- ✅ Keep responses consistent: `{ success, message?, count?, data }`.
- ✅ Uploads: max 10MB, only JPEG/PNG/WebP/PDF — enforced in `upload.routes.js`.
- ✅ Log privileged actions (approve, reject, user changes) to the AuditLog via `repo.addAuditLog`.

## 5️⃣ Git & Collaboration

- ✅ Branch naming: `feature/<name>`, `fix/<name>`, `docs/<name>`.
- ✅ Commit messages in imperative mood: "Add budget utilization endpoint", not "changes".
- ✅ Do not push directly to `main`; raise a PR and keep it small.
- ✅ Run `npm run build` (frontend) and start the server once before raising a PR.
- ✅ Reviewers check: docs updated? Postman updated? `.env.example` updated?

---

*Breaking these rules requires a documented reason in the PR description. When in doubt, ask.*
