export function buildClassroomGameAnalyticsRoute(classroomId: string, gameId: string): string {
  return `/teacher/dashboard/classroom/${classroomId}/game/${gameId}/analytics`
}
