export function resolveActorEmail(
  actorUserId: string | null,
  emailByUserId: ReadonlyMap<string, string>,
): { kind: 'empty' } | { kind: 'email'; email: string } | { kind: 'id'; id: string } {
  if (!actorUserId) return { kind: 'empty' }
  const email = emailByUserId.get(actorUserId)
  if (email) return { kind: 'email', email }
  return { kind: 'id', id: actorUserId }
}
