import { cn } from '@/lib/utils'

type VideoPreviewProps = {
  videoUrl: string
  fileName?: string
  className?: string
}

export function VideoPreview({ videoUrl, fileName = 'video', className }: VideoPreviewProps) {
  return (
    <video
      controls
      playsInline
      className={cn('h-auto w-auto max-w-full rounded object-contain', className)}
      preload="metadata"
      title={fileName}
    >
      <source
        src={videoUrl}
        type="video/mp4"
      />
      Your browser does not support the video tag.
    </video>
  )
}
