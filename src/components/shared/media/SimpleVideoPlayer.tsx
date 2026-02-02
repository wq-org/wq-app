interface SimpleVideoPlayerProps {
  videoUrl: string
  fileName?: string
}

export default function SimpleVideoPlayer({
  videoUrl,
  fileName = 'video',
}: SimpleVideoPlayerProps) {
  return (
    <video
      controls
      className="w-full h-auto max-h-[80vh] rounded"
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
