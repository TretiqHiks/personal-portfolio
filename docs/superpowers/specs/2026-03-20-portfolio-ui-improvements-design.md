# Portfolio UI/UX Improvements — Design Spec

**Date:** 2026-03-20
**Scope:** Projects page, About page, Contact form (EmailJS)
**Goal:** Improve recruiter-facing engagement and credibility. Portfolio supplements a CV and letter of motivation for software engineering roles.

---

## 1. Projects Page

### 1.1 Featured Hero Card
- If `activeProjects.length === 0`, skip the hero card entirely and render only the grid sections as-is (no broken layout).
- If `activeProjects.length >= 1`, the first active project renders as a full-width hero card at the top of the active section.
- Hero card has a taller image (`h-[320px]`).
- Title, summary, and tech stack tags are displayed prominently.
- **Structural fix for link nesting:** The hero card must NOT use a wrapping `<Link>` around the entire card. Instead:
  - A "View Details" `<Link>` button is an explicit element inside the card.
  - GitHub and demo links are separate `<a>` tags (with `target="_blank" rel="noopener noreferrer"`) placed as siblings to the "View Details" link — never nested inside another `<a>` or `<Link>`.
  - This avoids invalid HTML (`<a>` inside `<a>`).

### 1.2 Remaining Projects Grid
- All other active projects and all past projects stay in the existing 2-column grid.
- Image height increases from `h-40` (160px) to `h-56` (224px).
- **Same structural fix applies to grid cards:** GitHub and demo icons become real `<a>` tags. To avoid nesting, the card wrapper `<Link>` is removed. The card body becomes a plain `<div>`, and a "View Details" link is added explicitly inside the card footer alongside the GitHub/demo links.

### 1.3 Past Projects Visual Treatment
- Past project cards render at `opacity-80`.
- A small "Past" badge is added to each past card. The badge text uses the existing `t.pastLabel` key from `content.json` (currently `"Past"`).

---

## 2. About Page

### 2.1 Section Reorder
Current order: Quick Facts → Hero/Portrait → Journey → Passions → Curiosities
New order: **Hero/Portrait → Quick Facts → Journey → Passions → Curiosities**

Rationale: the personal intro + portrait is the most humanizing element and should be the first thing a recruiter encounters. After reordering, visually check that the spacing between the portrait section and Quick Facts feels natural (the portrait section has no section heading above it, just prose + image).

### 2.2 Journey Timeline — Interaction Fix
- Current behavior: `onMouseEnter`/`onMouseLeave` against a single `activeMilestone` state. Fails on touch devices.
- New behavior:
  - On **mobile (touch)**: click/tap toggles the detail open/closed. A small chevron icon indicates the card is expandable.
  - On **desktop**: hover behavior is preserved as-is (mouse enter opens, mouse leave closes).
  - **Conflict resolution:** click and hover share the same `activeMilestone` state. On desktop, clicking a card sets it as active (same as hovering). Mouse leave still collapses it. There is no "locked open" state — simplicity is preferred over a complex lock mechanism.

### 2.3 Passions Section
- Intentionally shows 3 passion cards (`slice(0, 3)` is kept by design — do not change).
- Each of the 3 cards gets a thin colored top border: use `border-t-2 border-primary` on all three cards uniformly.
- Card style otherwise unchanged.

---

## 3. Contact Form — EmailJS Integration

### 3.1 Dependency
- Run `npm install @emailjs/browser` before implementation. Add it to `package.json` as a dependency.

### 3.2 Replace Fake Send with EmailJS
- Remove the `setTimeout` simulation in `handleSubmit`.
- Import and use `emailjs.send(serviceId, templateId, templateParams, publicKey)` from `@emailjs/browser`.
- `templateParams` shape: `{ from_name, from_email, message }` mapped from the form state.
- On success: clear form, show success toast (existing `t.toasts.successTitle` / `t.toasts.successDescription`).
- On error: show destructive toast using two new keys added to `content.json` under `contact.toasts`:
  - `"errorTitle": "Something went wrong"`
  - `"errorDescription": "Failed to send your message. Please try again or reach out directly by email."`

### 3.3 Configuration
- Three environment variables stored in `.env` (Vite format):
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_PUBLIC_KEY`
- **Update `.gitignore`** to include `.env` (currently only `*.local` is ignored — `.env` must be added explicitly).
- Create a `.env.example` file documenting the three required keys with empty values.

### 3.4 Loading State
- The existing `sending` state and "Sending..." button label are preserved.
- Button remains disabled during the async EmailJS call.

---

## Out of Scope
- No new pages or routes.
- No changes to color scheme, typography, or animation system.
- No filtering, tabs, or masonry layout on Projects.
- No changes to the Navbar, Layout, or other pages.
- The 3-passion limit on the About page is intentional and stays.
