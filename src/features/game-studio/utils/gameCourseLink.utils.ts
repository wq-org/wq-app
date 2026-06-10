type GameCourseLinkSource = {
  course_id?: string | null
  game_course_links?: readonly { course_id: string }[] | null
}

/** Merges junction-table links with legacy games.course_id (pre-junction publishes). */
export function resolveGameLinkedCourseIds(game: GameCourseLinkSource): string[] {
  const ids = new Set<string>()

  for (const link of game.game_course_links ?? []) {
    if (link.course_id) ids.add(link.course_id)
  }

  if (game.course_id) ids.add(game.course_id)

  return Array.from(ids)
}
