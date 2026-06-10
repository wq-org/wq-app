export function buildClassroomGameAnalyticsRoute(classroomId: string, gameId: string): string {
  return `/teacher/dashboard/classroom/${classroomId}/game/${gameId}/analytics`
}

export function buildClassroomGamePlayRoute(classroomId: string, gameId: string): string {
  return `/teacher/dashboard/classroom/${classroomId}/game/${gameId}/play`
}

export function buildStudentClassroomGameHistoryRoute(classroomId: string, gameId: string): string {
  return `/student/dashboard/classroom/${classroomId}/game/${gameId}/history`
}
