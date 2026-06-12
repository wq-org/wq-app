import type { ElementFormatType, NodeKey } from 'lexical'

import { BlockWithAlignableContents } from '../components/LexicalBlockWithAlignableContents'

type YouTubeComponentProps = Readonly<{
  className: Readonly<{
    base: string
    focus: string
  }>
  format: ElementFormatType | null
  nodeKey: NodeKey
  videoID: string
}>

export function YouTubeComponent({ className, format, nodeKey, videoID }: YouTubeComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <div className="editor-youtubeEmbed mx-auto aspect-video w-full max-w-3xl">
        <iframe
          className="size-full rounded-xl border-0"
          src={`https://www.youtube-nocookie.com/embed/${videoID}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="YouTube video"
        />
      </div>
    </BlockWithAlignableContents>
  )
}
