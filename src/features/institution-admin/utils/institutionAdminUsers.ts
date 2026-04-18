export type InstitutionUserDialogCopyKeys = {
  roleLabelKey: string
  bodyKey: string
}

export function buildInitialsFromDisplayName(
  displayName?: string | null,
  username?: string | null,
): string {
  const source = displayName?.trim() || username?.trim() || 'U'
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

export function institutionUserRoleTranslationKey(role: string): string {
  if (role === 'student' || role === 'teacher' || role === 'institution_admin') {
    return `users.roles.${role}`
  }
  return 'users.roles.unknown'
}

export function withdrawFromClassDialogTranslationKeys(
  role: string,
): InstitutionUserDialogCopyKeys {
  if (role === 'student') {
    return {
      roleLabelKey: 'users.withdrawFromClassDialog.roleStudent',
      bodyKey: 'users.withdrawFromClassDialog.bodyStudent',
    }
  }
  return {
    roleLabelKey: 'users.withdrawFromClassDialog.roleTeacherCoTeacher',
    bodyKey: 'users.withdrawFromClassDialog.bodyTeacherCoTeacher',
  }
}

export function removeFromInstitutionDialogTranslationKeys(
  role: string,
): InstitutionUserDialogCopyKeys {
  switch (role) {
    case 'student':
      return {
        roleLabelKey: 'users.removeFromInstitutionDialog.roleStudent',
        bodyKey: 'users.removeFromInstitutionDialog.bodyStudent',
      }
    case 'teacher':
      return {
        roleLabelKey: 'users.removeFromInstitutionDialog.roleTeacher',
        bodyKey: 'users.removeFromInstitutionDialog.bodyTeacher',
      }
    case 'institution_admin':
      return {
        roleLabelKey: 'users.removeFromInstitutionDialog.roleCoTeacher',
        bodyKey: 'users.removeFromInstitutionDialog.bodyCoTeacher',
      }
    default:
      return {
        roleLabelKey: 'users.removeFromInstitutionDialog.roleUnknown',
        bodyKey: 'users.removeFromInstitutionDialog.bodyUnknown',
      }
  }
}
