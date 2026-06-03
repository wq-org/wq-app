import { getAvatarUrls } from '@wq/avatars'
import type { MemojiWithImageUrl } from '@wq/avatars'
import type { SelectAvatarOption } from '@/components/shared/drawers/SelectAvatarDrawer'

const AVATARS_CDN_BASE = 'https://cdn.jsdelivr.net/gh/wq-org/wq-avatars@v1.0.0'

export function memojiToAvatarOption(avatar: MemojiWithImageUrl): SelectAvatarOption {
  return {
    src: avatar.imageUrl,
    name: avatar.name,
    emoji: avatar.flag,
    description: avatar.sloganEn ?? null,
  }
}

export function getAllAvatarOptions(): SelectAvatarOption[] {
  return getAvatarUrls(undefined, AVATARS_CDN_BASE).map(memojiToAvatarOption)
}
