export default function useGamePersistence(): {
  save: () => Promise<void>
  load: () => Promise<any[]>
} {
  return {
    save: async () => {},
    load: async () => [],
  }
}
