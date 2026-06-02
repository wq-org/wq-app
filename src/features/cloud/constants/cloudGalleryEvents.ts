export const CLOUD_GALLERY_REFETCH_EVENT = 'wq:cloud-gallery-refetch' as const

export function requestCloudGalleryRefetch(): void {
  window.dispatchEvent(new CustomEvent(CLOUD_GALLERY_REFETCH_EVENT))
}
