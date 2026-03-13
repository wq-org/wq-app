import { useParams } from 'react-router-dom'
import { USER_ROLES } from '@/features/auth'
import Spinner from '@/components/ui/spinner'
import { useProfile } from '../hooks/useProfile'
import { ProfileTeacherView } from './ProfileTeacherView'
import { ProfileStudentView } from './ProfileStudentView'
import { ProfileInstitutionView } from './ProfileInstitutionView'
import { Text } from '@/components/ui/text'

export function ProfileView() {
  const { id } = useParams<{ id: string }>()
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

  // Route to appropriate content component based on role (snake_case from DB)
  const role = profile.role

  if (role === USER_ROLES.TEACHER) {
    return (
      <ProfileTeacherView
        profile={profile}
        userId={profile.user_id}
      />
    )
  }

  if (role === USER_ROLES.STUDENT) {
    return <ProfileStudentView profile={profile} />
  }

  if (role === USER_ROLES.INSTITUTION_ADMIN) {
    return <ProfileInstitutionView institutionId={profile.user_id} />
  }

  // If role doesn't match, show error
  return (
    <div className="flex items-center justify-center min-h-screen">
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
