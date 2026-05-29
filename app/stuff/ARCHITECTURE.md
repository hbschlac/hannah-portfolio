# "Stuff" — Backend Architecture (Phase 2 proposal)

> Status: **proposal / not yet built.** Phase 1 (front-end mockup at `/stuff`) is done and
> verified. This doc describes how to make it real. No backend code exists yet.

## Decisions locked (kickoff + Phase 2 Q&A)

- **Capture in v1:** iOS **Shortcut** (share-sheet → POST to API) + in-app **paste**.
- **Email forwarding:** **deprioritized** — documented below as a future add, not built in v1.
- **Share Sheet mechanism:** iOS Shortcut (reliable) — *not* the PWA Web Share Target,
  which is unreliable on iOS.
- **Aesthetic / UX:** locked in the mockup (white/black + pink accents, hybrid feed,
  standalone linkable notes, swipe/⋯ to archive).

---

## 1. Storage — Upstash Redis

Reuse the existing Upstash connection (`KV_REST_API_URL` / `KV_REST_API_TOKEN`) and mirror
the helper style in [`lib/jamie/kv.ts`](../../lib/jamie/kv.ts). New file: `lib/stuff/kv.ts`,
prefix `stuff:`.

Keys (JSON values; personal scale = hundreds of items, so plain arrays are fine):

| Key            | Shape                          |
|----------------|--------------------------------|
| `stuff:items`  | `StuffItem[]` (newest first)   |
| `stuff:notes`  | `Note[]`                       |

Types already defined in [`app/stuff/_data/mock.ts`](./_data/mock.ts) — promote them to
`lib/stuff/types.ts` and delete the mock seed once the API is live.

```
StuffItem = { id, url, title, source, type, image?, summary, length,
              savedAt, via: 'share'|'email'|'paste', status: 'inbox'|'read'|'saved' }
Note      = { id, title, body, updatedAt, linkedItemIds: string[] }
```

## 2. API routes (`app/api/stuff/…`)

Follow existing conventions (see `app/api/jamie/state/route.ts`). All routes are
single-user; see Auth (§6).

| Route                          | Method | Purpose                                            |
|--------------------------------|--------|----------------------------------------------------|
| `app/api/stuff/items/route.ts` | GET    | Return all items (UI reads this)                   |
| `app/api/stuff/items/route.ts` | PATCH  | Update one item's `status` (archive / read / save) |
| `app/api/stuff/items/route.ts` | DELETE | Remove an item                                     |
| `app/api/stuff/add/route.ts`   | POST   | **Ingest a URL** → scrape + summarize + store (§4) |
| `app/api/stuff/notes/route.ts` | GET/PUT/DELETE | Notes CRUD                                  |

## 3. Capture — how a link gets in

### 3a. iOS Shortcut (primary)  ✅ v1
A one-time installed Apple Shortcut named "Add to Stuff" that appears in the iOS share
sheet from any app (Safari, LinkedIn, Mail, etc.):

1. Shortcut input = the shared URL (and optional text).
2. Shortcut does a **POST** to `https://stuff.schlacter.me/api/stuff/add` with
   `{ url, title?, via: "share" }` and an `Authorization: Bearer <INGEST_TOKEN>` header.
3. Shows a quick "Saved to Stuff ✓" confirmation.

Why Shortcut over PWA Web Share Target: iOS does not reliably honor `share_target` for
installed PWAs, so the Shortcut is the dependable path. The Shortcut definition gets
checked into the repo (or documented) so it's reproducible.

### 3b. In-app paste (fallback)  ✅ v1
The Add sheet's paste field (already in the mockup) POSTs to the same `/api/stuff/add`.

### 3c. Email forwarding  ⏳ deferred
Not in v1. When picked up later, the leading options are:
- **Boring:** forward to Gmail → a "Stuff" label → a ~15-min cron scans the label (reuses
  `googleapis` + existing cron patterns) → ingests links. No DNS changes.
- **Instant:** Resend inbound webhook on `inbox.schlacter.me` (needs MX records) → fires
  the moment mail arrives.
Both ultimately call the same `/api/stuff/add`, so deferring it costs nothing now.

## 4. On ingest: preview + AI summary (`/api/stuff/add`)

```
POST /api/stuff/add  { url, title?, via }
 ├─ fetch(url)                      → HTML (timeout ~5s)
 ├─ parse OpenGraph                 → og:title, og:image, og:description, og:site_name
 ├─ detect type from host           → youtube/vimeo=video; spotify/apple/overcast=podcast; else article
 ├─ Anthropic API (claude-haiku-4-5, prompt-cached)
 │     prompt = title + og:description (+ trimmed body text)
 │     → 1–2 sentence summary
 ├─ build StuffItem { status:'inbox', savedAt:now, … }
 └─ prepend to stuff:items in Redis
```

- **Cost/speed:** Haiku keeps summaries cheap and sub-second; generate on save so the feed
  is instant. Needs `ANTHROPIC_API_KEY` in Vercel. (Use the `claude-api` skill's caching
  pattern.)
- **Failure handling:** if the fetch is blocked (paywall) or OG is missing, store
  `title || domain` + url with `summary: ""` rather than failing the save.
- ⚠️ **LinkedIn:** posts are auth-walled — OG scrape usually fails. Those save with the
  link + whatever title/text the Shortcut passed, and a blank preview. Accepted tradeoff.

## 5. Wiring the mockup to the backend

[`StuffProvider.tsx`](./_components/StuffProvider.tsx) is the only file that changes
shape — swap its `useState(MOCK_*)` + localStorage for:
- initial `GET /api/stuff/items` + `/api/stuff/notes` (with optimistic local updates),
- `setItemStatus` / `deleteItem` → `PATCH` / `DELETE`,
- `saveNote` / `deleteNote` → `PUT` / `DELETE`.

Every screen (`page.tsx`, `history/`, `notes/`, components) stays unchanged — they only
talk to the provider. This is why the mockup was built provider-first.

## 6. Auth

Single-user. Two layers:
- **UI:** localStorage password gate (the [`PasswordGate.tsx`](../jamie-bach-2026/_components/PasswordGate.tsx)
  pattern) wrapping `/stuff`. Personal reading history shouldn't be public.
- **Ingestion endpoints:** `/api/stuff/add` (and any future email webhook) require a long
  random `INGEST_TOKEN` bearer, since the Shortcut calls them unauthenticated-by-cookie.
- Read/mutate routes (`items`, `notes`) gated by the same session check as the UI.

Env vars to add in Vercel: `INGEST_TOKEN`, `ANTHROPIC_API_KEY`, `STUFF_PASSWORD`
(reuse existing `KV_REST_API_*`).

## 7. Hosting + PWA

- **Subdomain:** add `stuff.schlacter.me` to [`middleware.ts`](../../middleware.ts) using
  the existing `BACH_HOST` rewrite pattern (rewrite host → `/stuff`).
- **PWA:** `app/stuff/manifest.ts` (name "Stuff", standalone display, pink theme color) +
  app icons, so "Add to Home Screen" gives a real app icon and full-screen chrome.

## 8. Build order (when greenlit)

1. `lib/stuff/{types,kv}.ts` + seed Redis from current mock data.
2. `items` + `notes` routes; wire `StuffProvider` to them (drop the mock).
3. `/api/stuff/add` with OG scrape + Haiku summary + `INGEST_TOKEN`.
4. iOS Shortcut → point at `/api/stuff/add`; test share-sheet round-trip on the phone.
5. Password gate + manifest + `stuff.schlacter.me` middleware rewrite.
6. Deploy; verify on the live URL (push is step 1 of 2 — confirm in prod).

---

### Open questions for later
- Email forwarding mechanism (when un-deferred) — Gmail-cron vs Resend inbound.
- Whether tapping an item should auto-mark-read, or stay manual (current: manual).
- Tags/folders (Phase 3 maybe).
