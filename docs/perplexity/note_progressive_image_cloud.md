# Task: Progressive Image Loading in Cloud Gallery

**Date:** 2026-05-22  
**Context:** `src/features/cloud` — TeacherCloudPage → CloudGallery → buildCloudGalleryItems  
**Stack:** React 19 · Vite · TypeScript · Supabase Storage · Airbnb style guide

---

## Problem

The Cloud Gallery currently passes `file.url` (the raw Supabase Storage public URL, full resolution) directly to `CardInstantPreview` as `imageSrc`. For large wound-care images or lesson media this causes:

- A blank/broken box while the full image loads.
- Wasted bandwidth — always loading the original upload size instead of the rendered card size.
- No perceived-performance feedback for the teacher.

---

## Solution

Add **progressive image loading** using Supabase Storage's on-the-fly image transformation API:

1. Immediately render a tiny blurred preview (e.g. `width: 144, quality: 20`).
2. Load the full display image in the background.
3. Fade the full image in once it finishes loading.
4. Request the final image at the actual rendered width (not the raw original).

This requires **no additional uploads** — transformations are applied at the CDN layer via URL query params.

See: https://supabase.com/docs/guides/storage/serving/image-transformations

---

## Files to Create / Modify

### 1. NEW — `src/features/cloud/utils/buildProgressiveImageUrls.ts`

A pure utility that takes a Supabase bucket + storage path and returns `{ previewUrl, fullUrl }` using `supabase.storage.from(bucket).getPublicUrl(path, { transform })`. Keeps URL logic out of components.

```ts
import { supabase } from '@/lib/supabase'

export type ProgressiveImageUrls = {
  previewUrl: string
  fullUrl: string
}

/**
 * Returns two Supabase Storage transformed URLs for the same asset:
 * - `previewUrl` — tiny thumbnail for the blurred placeholder (144px wide, quality 20).
 * - `fullUrl`    — display-resolution image (target width, quality 85).
 *
 * Uses `getPublicUrl()` — only for **public** buckets.
 * For private buckets, swap to `createSignedUrl()` with the same transform options.
 */
export function buildProgressiveImageUrls(
  bucket: string,
  path: string,
  displayWidth: number,
): ProgressiveImageUrls {
  const { previewData } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: 144,
      quality: 20,
      resize: 'contain',
    },
  })

  const { fullData } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: {
      width: displayWidth,
      quality: 85,
      resize: 'contain',
    },
  })

  return {
    previewUrl: previewData.publicUrl,
    fullUrl: fullData.publicUrl,
  }
}
```

> **Security note:** `getPublicUrl()` is safe for public buckets. If cloud files are ever moved to a
> private bucket (institution-scoped clinical assets), replace with `createSignedUrl()` and generate
> signed URLs server-side or in an authenticated edge function — never with the service-role key in
> the browser. RLS policies must still guard the actual `cloud_files` table rows.

---

### 2. NEW — `src/features/cloud/components/ProgressiveImage.tsx`

A self-contained React 19 component that accepts `previewUrl` + `fullUrl` and manages the fade transition. No dependencies beyond React.

```tsx
import { useEffect, useState } from 'react'

export type ProgressiveImageProps = {
  previewUrl: string
  fullUrl: string
  alt: string
  width: number
  height: number
  className?: string
}

/**
 * Renders a blurred low-res placeholder immediately, then cross-fades
 * to the full-resolution image once it has finished loading.
 *
 * Uses two <img> stacked with `position: absolute` — no JS image object trickery
 * needed; the browser handles loading order via `onLoad`.
 */
export function ProgressiveImage({
  previewUrl,
  fullUrl,
  alt,
  width,
  height,
  className,
}: ProgressiveImageProps): JSX.Element {
  const [fullLoaded, setFullLoaded] = useState(false)

  // Reset when the source changes (e.g. different file selected in gallery).
  useEffect(() => {
    setFullLoaded(false)
  }, [fullUrl])

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        borderRadius: 12,
        background: 'var(--color-surface-offset, #f3f0ec)',
      }}
    >
      {/* Blurred placeholder — hidden from screen readers */}
      <img
        src={previewUrl}
        alt=""
        aria-hidden="true"
        width={width}
        height={height}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(12px)',
          transform: 'scale(1.04)',
          opacity: fullLoaded ? 0 : 1,
          transition: 'opacity 180ms ease',
        }}
      />

      {/* Full resolution image */}
      <img
        src={fullUrl}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setFullLoaded(true)}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: fullLoaded ? 1 : 0,
          transition: 'opacity 180ms ease',
        }}
      />
    </div>
  )
}
```

---

### 3. MODIFY — `src/features/cloud/utils/buildCloudGalleryItems.ts`

For `file.type === 'Image'` items, instead of passing `imageSrc: file.url` (the raw URL), pass the result of `buildProgressiveImageUrls` so that `CardInstantPreview` receives display-optimised URLs.

**Key change** — the `image` branch:

```ts
// Before:
items.push({
  id,
  subtitle: subtitleLabels.image,
  title: file.filename,
  description,
  imageSrc: file.url, // raw full-res URL
  content,
})

// After:
// 1. Derive the bucket name and path from `file.storagePath`.
//    storagePath format: "<bucket>/<rest/of/path>" — split at the first "/".
// 2. Call buildProgressiveImageUrls(bucket, path, CARD_DISPLAY_WIDTH_PX).
// 3. Pass both URLs to CardInstantPreview (requires adding previewSrc prop OR
//    use imageSrc for fullUrl and let the component internally use ProgressiveImage).
```

> **Implementation decision:** Check whether `CardInstantPreview` already accepts a `previewSrc`
> prop. If not, add one and update the image rendering inside it to use `<ProgressiveImage>`.
> This keeps the progressive loading concern inside the shared component, not scattered across
> every feature that uses it.

---

### 4. MODIFY — `CardInstantPreview` image rendering (shared component)

If `CardInstantPreview` renders `imageSrc` with a plain `<img>`, swap that to:

```tsx
{
  previewSrc ? (
    <ProgressiveImage
      previewUrl={previewSrc}
      fullUrl={imageSrc}
      alt={title}
      width={CARD_DISPLAY_WIDTH_PX}
      height={CARD_DISPLAY_HEIGHT_PX}
    />
  ) : (
    <img
      src={imageSrc}
      alt={title}
      width={CARD_DISPLAY_WIDTH_PX}
      height={CARD_DISPLAY_HEIGHT_PX}
    />
  )
}
```

This keeps the upgrade backward-compatible — any caller that doesn't pass `previewSrc` still works.

---

## Supabase bucket configuration

Your current `file.url` from `mapCloudFilesToFileItems` is already the public URL. To verify the
bucket is public (required for `getPublicUrl` transformations):

```sql
select name, public from storage.buckets;
```

If the bucket is private, generate signed URLs with transform options in a Supabase Edge Function
or server-side route. Never call `createSignedUrl` with service-role credentials from the browser.

---

## Performance targets

| Asset type              | Preview request | Full request   |
| ----------------------- | --------------- | -------------- |
| Cloud gallery thumbnail | 144px / q20     | 480px / q85    |
| Lesson hero image       | 144px / q20     | 1280px / q85   |
| Avatar / small icon     | Omit preview    | 64–128px / q85 |

---

## Acceptance criteria

- [ ] Image cards in `CloudGallery` show a blurred placeholder within < 100 ms on a slow-3G simulation.
- [ ] Full image fades in with a 180 ms ease transition — no pop, no flicker.
- [ ] Layout does not shift (fixed `width` / `height` on the wrapper div).
- [ ] PDF and Video cards are NOT affected — only `file.type === 'Image'` uses progressive loading.
- [ ] `buildProgressiveImageUrls` is a pure, side-effect-free utility (no direct Supabase calls in the component).
- [ ] No service-role key is used anywhere on the client path.
- [ ] `ProgressiveImage` respects `prefers-reduced-motion` — if reduced motion is set, skip the fade and show the full image directly.
