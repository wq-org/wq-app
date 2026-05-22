import { supabase } from '@/lib/supabase'

const LEXICAL_CLOUD_FILE_ID_PATTERN = (cloudFileId: string) => `"cloudFileId":"${cloudFileId}"`

/**
 * Returns true when the cloud file is referenced by lesson content (inline Lexical images).
 * Checks `cloud_file_links` first (synced on lesson save), then scans `lessons.content` JSONB.
 */
export async function isFileUsedInLesson(cloudFileId: string): Promise<boolean> {
  const id = cloudFileId.trim()
  if (!id) return false

  const { count: linkCount, error: linkError } = await supabase
    .from('cloud_file_links')
    .select('id', { count: 'exact', head: true })
    .eq('cloud_file_id', id)
    .eq('link_entity_type', 'lesson')

  if (linkError) {
    console.error('[checkFileUsage] cloud_file_links', linkError)
  } else if ((linkCount ?? 0) > 0) {
    return true
  }

  const needle = LEXICAL_CLOUD_FILE_ID_PATTERN(id)
  const { count: lessonCount, error: lessonError } = await supabase
    .from('lessons')
    .select('id', { count: 'exact', head: true })
    .ilike('content::text', `%${needle}%`)

  if (lessonError) {
    console.error('[checkFileUsage] lessons.content', lessonError)
    return false
  }

  return (lessonCount ?? 0) > 0
}
