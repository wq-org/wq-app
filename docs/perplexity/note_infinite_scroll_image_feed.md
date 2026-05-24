# Task: Infinite Scroll Image Feed with Blurred Placeholder + Fade-In

> Follows `principle_frontend.md` (five-layer architecture) and `principle_clean_code.md` (naming, state, exports).

---

## Overview

Implement a paginated infinite-scroll image feed component. Each image uses `loading="lazy"`, a tiny blurred placeholder as a CSS background, and a CSS fade-in triggered on the `load` event.

Cloud image hosting: **Cloudinary** (free tier). Cloudinary URL transforms let you derive the tiny placeholder from the same `public_id` — no separate upload or build step.

| URL transform                | Purpose                    | Approx. size |
| ---------------------------- | -------------------------- | ------------ |
| `w_20,e_blur:200,q_1,f_auto` | Tiny blurred placeholder   | ~300–600 B   |
| `w_800,q_auto,f_auto`        | Full-quality display image | normal       |

---

## Mental model (from video)

- `loading="lazy"` → network efficiency (browser skips off-screen fetches)
- Blurred placeholder → perceived speed (no blank white area)
- Load-triggered fade-in → polish (no progressive top-to-bottom stripe render)
- Shimmer `::before` pulse → loading feels intentional, removed once loaded

---

## 1 · Types — `features/image-feed/types/imageFeed.types.ts`

```ts
// Row — mirrors DB schema exactly
export type ImageFeedRow = {
  id: string
  cloudinary_public_id: string
  alt_text: string
  created_at: string
  institution_id: string
}

// Model — what the UI consumes
export type FeedImage = {
  id: string
  src: string // full-res Cloudinary URL
  placeholder: string // tiny blurred Cloudinary URL
  alt: string
  createdAt: Date
}

// Pagination cursor
export type FeedPage = {
  images: FeedImage[]
  nextCursor: string | null
}
```

---

## 2 · API module — `features/image-feed/api/imageFeedApi.ts`

```ts
import { supabase } from '@/lib/supabase'
import type { FeedImage, FeedPage, ImageFeedRow } from '../types/imageFeed.types'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const PAGE_SIZE = 12

function buildUrl(publicId: string, transform: string): string {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}`
}

function toFeedImage(row: ImageFeedRow): FeedImage {
  return {
    id: row.id,
    src: buildUrl(row.cloudinary_public_id, 'w_800,q_auto,f_auto'),
    placeholder: buildUrl(row.cloudinary_public_id, 'w_20,e_blur:200,q_1,f_auto'),
    alt: row.alt_text,
    createdAt: new Date(row.created_at),
  }
}

export async function fetchFeedPage(
  institutionId: string,
  cursor: string | null,
): Promise<FeedPage> {
  let query = supabase
    .from('image_feed')
    .select('id, cloudinary_public_id, alt_text, created_at, institution_id')
    .eq('institution_id', institutionId)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const rows = data as ImageFeedRow[]
  return {
    images: rows.map(toFeedImage),
    nextCursor: rows.length === PAGE_SIZE ? rows.at(-1)!.created_at : null,
  }
}
```

---

## 3 · Hook — `features/image-feed/hooks/useImageFeed.ts`

```ts
import { useState, useCallback } from 'react'
import { fetchFeedPage } from '../api/imageFeedApi'
import type { FeedImage } from '../types/imageFeed.types'

type State = {
  images: FeedImage[]
  nextCursor: string | null
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
}

export function useImageFeed(institutionId: string) {
  const [state, setState] = useState<State>({
    images: [],
    nextCursor: null,
    isLoading: true,
    isLoadingMore: false,
    error: null,
  })

  const loadInitial = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const page = await fetchFeedPage(institutionId, null)
      setState((s) => ({ ...s, ...page, isLoading: false }))
    } catch (e) {
      setState((s) => ({ ...s, isLoading: false, error: (e as Error).message }))
    }
  }, [institutionId])

  const loadMore = useCallback(async () => {
    if (!state.nextCursor || state.isLoadingMore) return
    setState((s) => ({ ...s, isLoadingMore: true }))
    try {
      const page = await fetchFeedPage(institutionId, state.nextCursor)
      setState((s) => ({
        ...s,
        images: [...s.images, ...page.images],
        nextCursor: page.nextCursor,
        isLoadingMore: false,
      }))
    } catch (e) {
      setState((s) => ({ ...s, isLoadingMore: false, error: (e as Error).message }))
    }
  }, [institutionId, state.nextCursor, state.isLoadingMore])

  return { ...state, loadInitial, loadMore }
}
```

---

## 4 · Components — `features/image-feed/components/`

### `FeedImageCard.tsx`

```tsx
import { useRef, useEffect } from 'react'
import type { FeedImage } from '../types/imageFeed.types'
import styles from './FeedImageCard.module.css'

type Props = { image: FeedImage }

export function FeedImageCard({ image }: Props) {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img) return
    if (img.complete) {
      img.classList.add(styles.loaded)
      return
    }
    const onLoad = () => img.classList.add(styles.loaded)
    img.addEventListener('load', onLoad)
    return () => img.removeEventListener('load', onLoad)
  }, [])

  return (
    <div
      className={styles.wrapper}
      style={{ backgroundImage: `url(${image.placeholder})` }}
    >
      <img
        ref={imgRef}
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className={styles.image}
      />
    </div>
  )
}
```

### `FeedImageCard.module.css`

```css
.wrapper {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: var(--radius-md);
  background-size: cover;
  background-position: center;
}

/* Shimmer pulse — removed once image loads */
.wrapper::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, oklch(1 0 0 / 0.08) 50%, transparent 100%);
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
  transition: opacity 300ms ease;
  pointer-events: none;
}

.wrapper:has(.loaded)::before {
  opacity: 0;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0;
  transition: opacity 400ms ease;
}

.image.loaded {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .wrapper::before {
    animation: none;
  }
  .image {
    transition: none;
  }
}
```

### `ImageFeedGrid.tsx`

```tsx
import { useEffect, useRef } from 'react'
import { FeedImageCard } from './FeedImageCard'
import type { FeedImage } from '../types/imageFeed.types'
import styles from './ImageFeedGrid.module.css'

type Props = {
  images: FeedImage[]
  hasMore: boolean
  isLoadingMore: boolean
  onLoadMore: () => void
}

export function ImageFeedGrid({ images, hasMore, isLoadingMore, onLoadMore }: Props) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) onLoadMore()
      },
      { rootMargin: '400px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore])

  return (
    <section
      aria-label="Image feed"
      className={styles.grid}
    >
      {images.map((img) => (
        <FeedImageCard
          key={img.id}
          image={img}
        />
      ))}
      <div
        ref={sentinelRef}
        aria-hidden="true"
      />
      {isLoadingMore && (
        <p
          className={styles.loadingMore}
          aria-live="polite"
        >
          Loading more…
        </p>
      )}
    </section>
  )
}
```

### `ImageFeedGrid.module.css`

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--space-4);
}

.loadingMore {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  padding: var(--space-4) 0;
}
```

---

## 5 · Barrel — `features/image-feed/index.ts`

```ts
export { ImageFeedGrid } from './components/ImageFeedGrid'
export { FeedImageCard } from './components/FeedImageCard'
export { useImageFeed } from './hooks/useImageFeed'
export type { FeedImage, FeedPage, ImageFeedRow } from './types/imageFeed.types'
```

---

## 6 · DB Migration

```sql
create table image_feed (
  id                   uuid primary key default gen_random_uuid(),
  cloudinary_public_id text not null,
  alt_text             text not null default '',
  institution_id       uuid not null references institutions(id) on delete cascade,
  created_at           timestamptz not null default now()
);

create index on image_feed (institution_id, created_at desc);

-- RLS: only institution members may read
alter table image_feed enable row level security;

create policy "Members can view feed"
  on image_feed for select
  using (
    exists (
      select 1 from institution_memberships m
      where m.institution_id = image_feed.institution_id
        and m.user_id = auth.uid()
    )
  );
```

---

## 7 · Environment

Add to `.env`:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

## Acceptance Criteria

- [ ] First page loads on mount via `loadInitial`; subsequent pages load when sentinel enters viewport (400 px pre-fetch margin)
- [ ] Every image shows the blurred Cloudinary placeholder immediately as CSS background
- [ ] Shimmer pulse overlay disappears on `img.complete` / `load` event; real image fades in at `opacity: 0 → 1`
- [ ] `loading="lazy"` on every `<img>`; browser skips fetch until image is near viewport
- [ ] `prefers-reduced-motion` disables shimmer animation and fade transition
- [ ] No `export default` anywhere in the feature; consumers import from `@/features/image-feed` barrel only
- [ ] Component layer has zero Supabase imports; API layer has zero JSX
- [ ] Raw `ImageFeedRow` never escapes the API module — `toFeedImage()` is the only mapper
- [ ] RLS policy enforces `institution_id` isolation at the DB level
- [ ] `VITE_CLOUDINARY_CLOUD_NAME` is set; `.env.example` updated
