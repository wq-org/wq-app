import {
  $getNodeByKey,
  $getRoot,
  $isElementNode,
  type LexicalEditor,
  type LexicalNode,
  type NodeKey,
} from 'lexical'

import {
  getFileSignedUrl,
  lookupCloudFileIdByStoragePath,
  lookupStoragePathByCloudFileId,
} from '@/features/cloud'
import { LESSON_HYDRATION_TAG } from '@/features/lesson'

import { $isImageNode } from '../nodes/ImageNode'

const SIGNED_URL_TTL_SECONDS = 3600

type ImageRefreshTarget = {
  nodeKey: NodeKey
  filepath: string | null
  cloudFileId: string | null
}

function collectImageNodes(node: LexicalNode, out: ImageRefreshTarget[]): void {
  if ($isImageNode(node)) {
    out.push({
      nodeKey: node.getKey(),
      filepath: node.getFilepath(),
      cloudFileId: node.getCloudFileId(),
    })
    return
  }

  if ($isElementNode(node)) {
    for (const child of node.getChildren()) {
      collectImageNodes(child, out)
    }
  }
}

async function resolveStoragePath(
  filepath: string | null,
  cloudFileId: string | null,
): Promise<string | null> {
  const trimmedPath = filepath?.trim()
  if (trimmedPath) return trimmedPath

  const trimmedId = cloudFileId?.trim()
  if (!trimmedId) return null

  return lookupStoragePathByCloudFileId(trimmedId)
}

/**
 * Refreshes signed `src` URLs and backfills `cloudFileId` / `filepath` on image nodes
 * after hydrating persisted Lexical JSON (signed URLs expire; durable refs do not).
 */
export async function refreshCloudImagesInEditor(editor: LexicalEditor): Promise<void> {
  const targets: ImageRefreshTarget[] = []

  editor.getEditorState().read(() => {
    collectImageNodes($getRoot(), targets)
  })

  if (targets.length === 0) return

  const patches: Array<{
    nodeKey: NodeKey
    src: string
    filepath: string | null
    cloudFileId: string | null
  }> = []

  await Promise.all(
    targets.map(async ({ nodeKey, filepath, cloudFileId }) => {
      const storagePath = await resolveStoragePath(filepath, cloudFileId)
      if (!storagePath) return

      const signedUrl = await getFileSignedUrl(storagePath, SIGNED_URL_TTL_SECONDS)
      if (!signedUrl) return

      let resolvedCloudFileId = cloudFileId?.trim() || null
      if (!resolvedCloudFileId) {
        resolvedCloudFileId = await lookupCloudFileIdByStoragePath(storagePath)
      }

      patches.push({
        nodeKey,
        src: signedUrl,
        filepath: storagePath,
        cloudFileId: resolvedCloudFileId,
      })
    }),
  )

  if (patches.length === 0) return

  editor.update(
    () => {
      for (const patch of patches) {
        const node = $getNodeByKey(patch.nodeKey)
        if (!$isImageNode(node)) continue
        node.setSrc(patch.src)
        node.setCloudReference(patch.filepath, patch.cloudFileId)
      }
    },
    { tag: LESSON_HYDRATION_TAG },
  )
}
