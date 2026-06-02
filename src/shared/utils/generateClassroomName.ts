import classroomNamingConfig from '@/features/institution-admin/config/classroomNamingConfig.json'

export type ClassroomNameTheme = 'superhero' | 'luxury'

export function generateClassroomName(theme: ClassroomNameTheme): string {
  const { suffixes, themes } = classroomNamingConfig
  const baseTokens = themes[theme].baseTokens
  const randomBase = baseTokens[Math.floor(Math.random() * baseTokens.length)]
  const randomToken = randomBase.tokens[Math.floor(Math.random() * randomBase.tokens.length)]
  const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  return `${randomToken} ${randomSuffix}`
}
