import { useParams } from 'react-router-dom'
import { USER_ROLES } from '@/features/auth'
import { Spinner } from '@/components/ui/spinner'
import { Text } from '@/components/ui/text'
import { useProfile } from '../hooks/useProfile'
import { ProfileInstitutionView } from './ProfileInstitutionView'
import { ProfileStudentPublicPanel } from './ProfileStudentPublicPanel'
import { ProfileTeacherPublicPanel } from './ProfileTeacherPublicPanel'

export function ProfileView() {
  const { id } = useParams<{ id: string }>()
  const { profile, loading, error } = useProfile(id)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner
          variant="gray"
          size="lg"
        />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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

  const role = profile.role

  if (role === USER_ROLES.TEACHER) {
    return (
      <ProfileTeacherPublicPanel
        profile={profile}
        userId={profile.user_id}
      />
    )
  }

  if (role === USER_ROLES.STUDENT) {
    return <ProfileStudentPublicPanel profile={profile} />
  }

  if (role === USER_ROLES.INSTITUTION_ADMIN) {
    return <ProfileInstitutionView institutionId={profile.user_id} />
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Text
        as="p"
        variant="body"
        className="text-gray-500"
      >
        Invalid profile type
      </Text>
    </div>
  )
}
