import { BlurredImage } from '@/components/ui/blurred-image'
import { Text } from '@/components/ui/text'

const GAME_HEADER_AVATAR_URL =
  'https://ocuhrvjuonijfnhwmgjb.supabase.co/storage/v1/object/public/avatars/avatar_male_brazil_01.png'

export function GameHeader() {
  return (
    <div className="inline-flex flex-col items-center gap-3 rounded-3xl bg-white/30 px-4 py-3 shadow-sm backdrop-blur-md">
      <div className="size-14 shrink-0">
        <BlurredImage
          src={GAME_HEADER_AVATAR_URL}
          alt="Hallie Parker"
          isBlurred
          variant="avatar"
          className="border border-white/35"
          containerClassName="size-full"
          backdropClassName="scale-115 opacity-70"
        />
      </div>
      <Text
        variant="small"
        className="font-medium text-white"
      >
        Hallie Parker
      </Text>
    </div>
  )
}
