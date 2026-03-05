import { buildBlockData } from '@yoopta/editor'

export function createYooptaStarterContentObject(): Record<string, unknown> {
  const block = buildBlockData()
  return { [block.id]: block as unknown as Record<string, unknown> }
}

export function createYooptaStarterContentJson(): string {
  return JSON.stringify(createYooptaStarterContentObject())
}
