import type { GameCardProps, GameCatalogItem } from '../types/game-studio.types'

type GameCatalogCardOptions = {
  route?: string
  button?: string
  fallbackDescription?: string
}

export function toGameCatalogCardProps(
  game: GameCatalogItem,
  options: GameCatalogCardOptions = {},
): GameCardProps {
  return {
    id: game.id,
    title: game.title,
    description: game.description?.trim() || options.fallbackDescription || '',
    route: options.route,
    button: options.button,
    themeId: game.themeId,
    version: game.publishedVersion ?? game.version ?? undefined,
    status: game.status === 'published' ? 'published' : 'draft',
  }
}
