export const AVATAR_PLACEHOLDER_SRC = '/favicon.ico'

export const STORAGE_BUCKETS = {
  cloud: 'cloud',
  avatars: 'avatars',
} as const

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS]

// Background Images
export const BACKGROUND_HUMAN =
  'https://jocymjpiyvtgpmkxhzrb.supabase.co/storage/v1/object/public/backgrounds/background_human.png'
export const DEFAULT_COURSE_BACKGROUND =
  'https://jocymjpiyvtgpmkxhzrb.supabase.co/storage/v1/object/public/backgrounds/background_img.png'

// Institution Constants
export const DEFAULT_INSTITUTION_IMAGE = '/favicon.ico'
