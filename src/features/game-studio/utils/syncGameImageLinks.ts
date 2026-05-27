import type { Node } from '@xyflow/react'
import type { SerializedEditorState, SerializedLexicalNode } from 'lexical'

import { lookupCloudFileIdByStoragePath } from '@/features/cloud'
import { extractCloudFileIdsFromLexicalState } from '@/features/lexical-editor'
import { supabase } from '@/lib/supabase'

import {
  GAME_IMAGE_PIN_TYPE,
  type GameImagePinNodeData,
} from '../nodes/game-image-pin/image-pin.schema'
import { collectLexicalStatesFromGameNodes } from './collectLexicalStatesFromGameNodes'
import { resolveGameImagePinStoragePath } from './gameImagePinStoragePath'

type ChildBearing = { children?: unknown } & SerializedLexicalNode
type ImageLikeNode = { type: string; cloudFileId?: string | null; filepath?: string | null }

function isImageLikeNode(value: unknown): value is ImageLikeNode {
  return (
    typeof value === 'object' && value !== null && (value as { type?: unknown }).type === 'image'
  )
}

function extractFilepathsFromLexicalState(
  state: SerializedEditorState | null | undefined,
): string[] {
  if (!state?.root) return []

  const paths = new Set<string>()

  function walk(node: unknown): void {
    if (isImageLikeNode(node)) {
      const filepath = node.filepath?.trim()
      if (filepath && !node.cloudFileId) {
        paths.add(filepath)
      }
    }
    const children = (node as ChildBearing).children
    if (Array.isArray(children)) {
      for (const child of children) walk(child)
    }
  }

  walk(state.root)
  return Array.from(paths)
}

export function extractCloudFileIdsFromImagePinNodes(nodes: readonly Node[]): string[] {
  const found = new Set<string>()

  for (const node of nodes) {
    if (node.type !== GAME_IMAGE_PIN_TYPE) continue
    const cloudFileId = (node.data as GameImagePinNodeData).cloudFileId
    if (typeof cloudFileId === 'string' && cloudFileId.trim()) {
      found.add(cloudFileId.trim())
    }
  }

  return Array.from(found)
}

/** Collects cloud file ids from pins, resolving storage paths when `cloudFileId` is missing. */
export async function collectCloudFileIdsFromImagePinNodes(
  nodes: readonly Node[],
): Promise<string[]> {
  const found = new Set<string>()

  for (const node of nodes) {
    if (node.type !== GAME_IMAGE_PIN_TYPE) continue
    const data = node.data as GameImagePinNodeData
    const explicitId = data.cloudFileId?.trim()
    if (explicitId) {
      found.add(explicitId)
      continue
    }

    const storagePath = resolveGameImagePinStoragePath(data)
    if (!storagePath) continue

    const resolvedId = await lookupCloudFileIdByStoragePath(storagePath)
    if (resolvedId) found.add(resolvedId)
  }

  return Array.from(found)
}

async function collectCloudFileIdsFromLexicalStates(
  states: readonly SerializedEditorState[],
): Promise<string[]> {
  const found = new Set<string>()

  for (const state of states) {
    for (const id of extractCloudFileIdsFromLexicalState(state)) {
      found.add(id)
    }

    for (const filepath of extractFilepathsFromLexicalState(state)) {
      const resolvedId = await lookupCloudFileIdByStoragePath(filepath)
      if (resolvedId) found.add(resolvedId)
    }
  }

  return Array.from(found)
}

/** Cloud file ids from image pins and embedded Lexical fields (e.g. drag-drop description). */
export async function collectCloudFileIdsFromGameNodes(nodes: readonly Node[]): Promise<string[]> {
  const found = new Set<string>()

  for (const id of await collectCloudFileIdsFromImagePinNodes(nodes)) {
    found.add(id)
  }

  const lexicalStates = collectLexicalStatesFromGameNodes(nodes)
  for (const id of await collectCloudFileIdsFromLexicalStates(lexicalStates)) {
    found.add(id)
  }

  return Array.from(found)
}

export async function syncGameImageLinks(params: {
  gameVersionId: string
  institutionId: string
  nodes: readonly Node[]
}): Promise<void> {
  const { gameVersionId, institutionId, nodes } = params
  if (!gameVersionId || !institutionId) return

  const cloudFileIds = await collectCloudFileIdsFromGameNodes(nodes)

  const { error: deleteError } = await supabase.from('cloud_file_links').delete().match({
    link_entity_type: 'game_version',
    entity_id: gameVersionId,
    link_purpose: 'inline_media',
  })

  if (deleteError) {
    console.error('[syncGameImageLinks] delete failed', deleteError)
    return
  }

  if (cloudFileIds.length === 0) return

  const rows = cloudFileIds.map((id) => ({
    institution_id: institutionId,
    cloud_file_id: id,
    link_entity_type: 'game_version' as const,
    entity_id: gameVersionId,
    link_purpose: 'inline_media' as const,
  }))

  const { error: insertError } = await supabase.from('cloud_file_links').upsert(rows, {
    onConflict: 'cloud_file_id,link_entity_type,entity_id,link_purpose',
  })

  if (insertError) {
    console.error('[syncGameImageLinks] upsert failed', insertError)
  }
}
