import { $getRoot, $getSelection, $isRangeSelection, type LexicalEditor } from 'lexical'

import { $createYouTubeNode } from '../nodes/YouTubeNode'

export const insertYouTubeEmbed = (editor: LexicalEditor, videoId: string) => {
  editor.update(() => {
    const youtubeNode = $createYouTubeNode(videoId)
    const selection = $getSelection()

    if ($isRangeSelection(selection)) {
      selection.insertNodes([youtubeNode])
      return
    }

    $getRoot().append(youtubeNode)
  })
}
