import { useParams } from 'react-router-dom'
import { CommandPalette } from '@/features/command-palette'
import { useUser } from '@/contexts/user'
import { useProfile } from '../hooks/useProfile'
import { USER_ROLES } from '@/features/auth/types/auth.types'
import Spinner from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { ProfileTeacherView } from '../components/ProfileTeacherView'
import { ProfileStudentView } from '../components/ProfileStudentView'
import { ProfileInstitutionView } from '../components/ProfileInstitutionView'

export default function ProfileViewPage() {
  const { id } = useParams<{ id: string }>()
  const { getRole } = useUser()
  const role = getRole() || 'student'
  const { profile, loading, error } = useProfile(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner
          variant="gray"
          size="lg"
        />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text
          as="p"
          variant="body"
          className="text-gray-500"
        >
          Profile not found
        </Text>
      </div>
    )
  }

  const profileRole = profile.role

  return (
    <>
      {profileRole === USER_ROLES.TEACHER && (
        <ProfileTeacherView
          profile={profile}
          userId={profile.user_id}
        />
      )}
      {profileRole === USER_ROLES.STUDENT && <ProfileStudentView profile={profile} />}
      {profileRole === USER_ROLES.INSTITUTION_ADMIN && (
        <ProfileInstitutionView institutionId={profile.user_id} />
      )}
      {profileRole !== USER_ROLES.TEACHER &&
        profileRole !== USER_ROLES.STUDENT &&
        profileRole !== USER_ROLES.INSTITUTION_ADMIN && (
          <div className="flex items-center justify-center min-h-screen">
            <Text
              as="p"
              variant="body"
              className="text-gray-500"
            >
              Invalid profile type
            </Text>
          </div>
        )}
      <CommandPalette commandBarContext={role} />
    </>
  )
}
