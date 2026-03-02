import { supabase } from '@/lib/supabase'
import type { AvatarOption, Institution } from '../types/onboarding.types'

/**
 * Fetch all available avatars from Supabase storage
 * Returns an array of avatar options with metadata
 */
export async function fetchAvatars(): Promise<AvatarOption[]> {
  try {
    const { data: files, error } = await supabase.storage.from('avatars').list('meta_data', {
      limit: 100,
      offset: 0,
    })

    if (error || !files) {
      console.error('Error fetching avatars:', error)
      // Return fallback avatar
      return [{ name: 'Willfryd', src: '/favicon.ico', emoji: '🎉', description: '' }]
    }

    // Filter for JSON metadata files only
    const jsonFiles = files.filter((file) => file.name.endsWith('.json'))

    if (jsonFiles.length === 0) {
      console.error('No JSON metadata files found in avatars/meta_data/')
      return [{ name: 'Willfryd', src: '/favicon.ico', emoji: '🎉', description: '' }]
    }

    // Fetch metadata and pair with PNG images
    const avatarPromises = jsonFiles.map(async (jsonFile) => {
      try {
        // Download and parse the JSON metadata
        const { data: fileData, error: downloadError } = await supabase.storage
          .from('avatars')
          .download(`meta_data/${jsonFile.name}`)

        if (downloadError || !fileData) {
          console.error(`Error downloading ${jsonFile.name}:`, downloadError)
          return null
        }

        const text = await fileData.text()
        const metadata = JSON.parse(text)

        // Get the corresponding PNG file (same name, different extension)
        const imageName = jsonFile.name.replace('.json', '.png')

        // Store just the path, not the signed URL
        // We'll create signed URLs when displaying
        return {
          name: metadata.name || imageName,
          src: `faces/${imageName}`, // ← just the path
          emoji: metadata.emoji || '🎉',
          description: metadata.description || '',
        } as AvatarOption
      } catch (parseError) {
        console.error(`Error parsing ${jsonFile.name}:`, parseError)
        return null
      }
    })

    const avatarResults = await Promise.all(avatarPromises)
    // Filter out any nulls from failed parses
    const validAvatars = avatarResults.filter((avatar): avatar is AvatarOption => avatar !== null)

    if (validAvatars.length === 0) {
      console.error('No valid avatars could be loaded')
      return [{ name: 'Willfryd', src: '/favicon.ico', emoji: '🎉', description: '' }]
    }

    return validAvatars
  } catch (err) {
    console.error('Error loading avatars:', err)
    return [{ name: 'Willfryd', src: '/favicon.ico', emoji: '🎉', description: '' }]
  }
}

/**
 * Fetch all institutions from the database
 * Returns an array of institutions ordered by name
 */
export async function fetchInstitutions(): Promise<Institution[]> {
  try {
    const { data, error } = await supabase
      .from('institutions')
      .select('id, name, description, email, address, website')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching institutions:', error)
      return []
    }

    return data || []
  } catch (err) {
    console.error('Unexpected error fetching institutions:', err)
    return []
  }
}

/**
 * Link user to selected institutions
 * @param userId - The user's ID
 * @param institutionIds - Array of institution IDs to link
 */
export async function linkUserInstitutions(
  userId: string,
  institutionIds: string[],
): Promise<void> {
  if (institutionIds.length === 0) {
    return
  }

  try {
    const rows = institutionIds.map((institutionId) => ({
      user_id: userId,
      institution_id: institutionId,
    }))

    // Use upsert to avoid duplicate key errors
    const { error } = await supabase.from('user_institutions').upsert(rows, {
      onConflict: 'user_id,institution_id',
      ignoreDuplicates: false, // Update joined_at if already exists
    })

    if (error) {
      console.error('Error linking institutions:', error)
      throw error
    }
  } catch (error) {
    console.error('Error in linkUserInstitutions:', error)
    throw error
  }
}
