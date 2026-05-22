## Goal

Allow users to browse a staggered “Today”-style card grid and open any card into a centered instant preview with a dimmed overlay, shared-element animation, and readable body copy.

## Description

**Context:** Reusable marketing/editorial pattern for WQ Game Studio demos and landing content. Lives in `@/components/shared/card-instant-preview` and is showcased on the developer test route (`/test`).

**Scope:** Frontend only (React 19 + TypeScript + Tailwind `animate-in` / `animate-out`). Local state only — no API, no persistence. MacBook Neo demo uses remote Apple CDN image URLs. Out of scope: routing changes, Supabase/RLS, bundling Apple assets into `public/`, GSAP.

**Component layer:** `CardInstantPreview`, `CardInstantPreviewList`, `CardInstantPreviewListItem`, `CardInstantPreviewExpanded`.

**Role scope:** Any authenticated or unauthenticated user viewing `/test` (dev gallery).

**RLS implication:** None — no data reads or writes.

## User Action 1

**Trigger:** User clicks (or activates with Enter/Space) a card in the grid.

**Outcome:** Overlay fades in, non-selected cards dim, the clicked card’s content FLIP-expands to a centered modal showing image header, category, title, and body paragraphs.

## User Action 2

**Trigger:** User clicks the overlay or presses Escape while a card is expanded.

**Outcome:** Expanded card FLIP-collapses back to its grid cell, overlay fades out, grid returns to full opacity.

## Initial State

1. Heading displays “Today” (or custom `heading` prop) with optional avatar on the right.
2. Exactly four cards render in a 2×2 staggered grid (wide/narrow alternating).
3. Each card shows category, title, and a cropped background image with per-card offset styles.
4. Overlay has `opacity: 0` and `pointer-events: none`.
5. No card has `aria-expanded="true"`; body panels are not visible.

## Sample Interaction

1. User opens `/test` and scrolls to “CardInstantPreview”.
2. User clicks the wide card “Built for Apple Intelligence” (category: Highlights).
3. Overlay reaches opacity 1 over 0.25s; other cards fade to 30% opacity; card content animates to center over ~0.5s.
4. White body panel fades in with two paragraphs about MacBook Neo AI features.
5. User presses Escape.
6. Card animates back to grid position; overlay hides; all cards return to full opacity.

## Detailed Requirements

1. The component accepts an `items` array; each item requires `id`, `category`, `title`, `imageSrc`, and `body` (string array).
2. Optional per-item `imageStyle` applies inline positioning (`top`, `bottom`, `left`, `right`, `width`, `height`) on the image.
3. Optional `variant: 'dark'` renders white category/title text; default variant uses dark text.
4. Optional `layout: 'wide' | 'narrow'` controls column span in the 2-column grid (wide = `col-span-2` in alternating rows pattern).
5. Grid max width is ~990px, centered, with ~28px card border radius.
6. Clicking a card while another is open is ignored until the current animation completes.
7. Overlay covers the viewport at `z-index` 40 with ~40% black scrim.
8. Expanded card sits at `z-index` 50, max height ~90vh, max width ~720px.
9. Open uses `animate-in fade-in-0 slide-in-from-bottom-4` on the expanded card and `animate-in fade-in-0` on the overlay.
10. Close uses `animate-out fade-out-0 slide-out-to-bottom-4` on the expanded card and `animate-out fade-out-0` on the overlay (300ms).
11. Body paragraphs render only in the expanded white panel below the image header.
12. Cards expose `aria-expanded` and are keyboard activatable (Enter/Space).
13. Expanded state uses `role="dialog"`, `aria-modal="true"`, labelled by the card title.
14. Escape closes the dialog and returns focus to the triggering card.
15. `onOpen(id)` and `onClose()` callbacks fire when transitions start (after reduced-motion instant path too).
16. GSAP context reverts on unmount; no tweens leak after leaving `/test`.

## Animation Spec

1. Layout transition duration: 0.5s, ease `[0.39, 0.14, 0.26, 1]` (iOS App Store curve).
2. Overlay fade: 0.25s, ease `power2.out`.
3. Inactive cards opacity: 0.3 over 0.25s on open; restore on close.
4. Body panel fade: 0.2s after FLIP completes on open; hide immediately on close start.
5. Reduced motion: skip FLIP and body stagger; set final classes immediately.

## Accessibility Notes

1. Focus moves to the expanded dialog container on open; restored to trigger on close.
2. Images use `alt` derived from card title.
3. Overlay is `aria-hidden` when closed.

## Question 1 / Subtask 1

**Title:** Task specification document

**Acceptance Criteria:** `docs/architecture/card-instant-preview-task.md` exists with all seven core keywords filled and numbered lists.

## Question 2 / Subtask 2

**Title:** CardInstantPreview module scaffold

**Acceptance Criteria:** Types, card, expanded body markup, root component, and barrel export exist under `src/components/shared/card-instant-preview/`.

## Question 3 / Subtask 3

**Title:** CSS enter/exit transitions

**Acceptance Criteria:** Expanded card and overlay use Tailwind `animate-in` / `animate-out` classes; close waits 300ms before unmounting.

## Question 4 / Subtask 4

**Title:** Shared export and test page demo

**Acceptance Criteria:** Component exported from `@/components/shared`; `/test` renders four MacBook Neo cards with remote image URLs and sample body copy.
