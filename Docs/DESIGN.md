# 🎨 Design System

**ReimburseFlow – Dark. Bold. Enterprise.**

This document defines the visual design system, UI components, and user experience guidelines for ReimburseFlow. The goal is to create a modern, Appwrite-inspired dark console with a consistent, accessible, and professional interface.

---

## 1. Design Principles

| | | |
|:---:|:---:|:---:|
| **👥 User-Centered** | **🌑 Dark First** | **🧩 Consistent** |
| Simple and intuitive for employees, managers, and finance teams. | Reduce eye strain; content (tables, charts, receipts) is the hero. | Follow a unified token system (`aw-*` in tailwind.config.js). |

## 2. Color Palette

Primary colors used across the application (defined in [tailwind.config.js](../tailwind.config.js)):

| Color | Value | Usage |
|---|---|---|
| 🟦 Background | `#09090b` (`aw-bg`) | App background |
| ⬛ Surface | `#0d0d10` (`aw-surface`) | Sidebar, navbar |
| 🃏 Card | `#131316` (`aw-card`) | Cards, panels, modals |
| 🩷 Primary | `#fd366e` (`aw-pink`) | Main brand color: buttons, links, active states |
| 🩷 Primary Hover | `#f02e65` (`aw-pinkHover`) | Button hover states |
| 🟧 Accent | `#fe9567` (`aw-orange`) | Gradients, secondary highlights |
| 🟨 Warning | `#f99c00` (`aw-amber`) | Warnings, pending states |
| 🟩 Success | `#10b981` (`aw-emerald`) | Success messages, approved states |
| 🟦 Info | `#3080ff` (`aw-blue`) | Info, links, charts |
| 🟪 Secondary | `#818cf8` (`aw-purple`) | Badges, highlights |
| 🟥 Error | `#ef4444` (`red-500`) | Error messages, rejected states, validation |
| 🔤 Text | `#f4f4f5` (`aw-textBright`) | Primary text |
| 🔤 Text Muted | `#a1a1aa` (`aw-textMuted`) | Secondary text, captions |
| 🔲 Border | `rgba(255,255,255,0.08)` (`aw-border`) | Card & divider borders |

**Gradient:** `aw-gradient` = `linear-gradient(135deg, #fd366e 0%, #fe9567 100%)` — used for brand CTAs and logo.

## 3. Typography

We use **Inter** as the primary font for a clean, modern and highly readable console. **Space Grotesk** is the display font for headings/logo, and **JetBrains Mono** for IDs, amounts and code.

| Style | Font | Size | Weight | Usage |
|---|---|---|---|---|
| Aa Display | Space Grotesk | 30px / 36px | 700 | Page titles, brand |
| H1 | Inter | 24px | 700 | Section headings |
| H2 | Inter | 18px | 600 | Card titles |
| Body | Inter | 14px | 400 | Default text |
| Small | Inter | 12px | 400 | Captions, table meta |
| Mono | JetBrains Mono | 13px | 500 | Expense IDs, amounts, codes |

## 4. UI Components

Standard components to be used throughout the app (see `src/components/Shared`):

**Buttons**

`Primary` — pink solid (`bg-aw-pink hover:bg-aw-pinkHover text-white rounded-lg`)
`Secondary` — subtle dark (`bg-aw-subtle hover:bg-aw-cardHover border border-aw-border`)
`Destructive` — red solid (`bg-red-500 hover:bg-red-600`) for delete/reject actions

**Cards** — `bg-aw-card border border-aw-border rounded-2xl shadow-aw-glow-card`

**Status Badges**

| Status | Style |
|---|---|
| 🟡 Pending | `amber` text + soft amber bg |
| 🟢 Approved | `emerald` text + soft emerald bg |
| 🔴 Rejected | `red` text + soft red bg |
| 🔵 Draft / Reimbursed | `blue` / `purple` variants |

**Inputs** — `bg-aw-subtle border border-aw-border rounded-lg focus:ring-2 focus:ring-aw-pink/40 focus:border-aw-pink`

**Modals** — centered, `bg-aw-card border border-aw-border rounded-2xl`, backdrop `bg-black/60 backdrop-blur-sm`

**Tables** — sticky header on `aw-surface`, row hover `aw-cardHover`, mono font for amounts.

## 5. Icons

Use **Lucide React** icons only (`lucide-react`). Icons are 16–20px, `stroke-width: 2`, and inherit text color. No emoji inside product UI (emoji allowed in docs).

## 6. Layout & Spacing

- Sidebar (desktop): 240px, `aw-surface`, collapsible on mobile with hamburger.
- Content max width: `max-w-7xl mx-auto`, padding `p-4 md:p-6`.
- Spacing scale: Tailwind default (4px base). Cards gap: `gap-4 md:gap-6`.
- Radii: inputs/buttons `rounded-lg`, cards/modals `rounded-2xl`.
- Motion: subtle only — `transition-colors duration-150`; no heavy animations.

## 7. Accessibility

- Minimum contrast 4.5:1 for text (muted text only on large/secondary elements).
- Every icon-only button needs `aria-label`.
- Focus states are always visible (`focus-visible:ring-aw-pink`).
- Forms: label + input pairing, error text below field in red.

---

*New UI must reuse these tokens before introducing any new color, font size, or shadow.*
