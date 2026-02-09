import { useParams } from 'react-router-dom'
import { USER_ROLES } from '@/features/auth/types/auth.types'
import { DotWaveLoader } from '@/components/shared'
import { useProfile } from '../hooks/useProfile'
import { TeacherProfileContent } from './TeacherProfileContent'
import { StudentProfileContent } from './StudentProfileContent'
import { InstitutionProfileContent } from './InstitutionProfileContent'
import { Text } from '@/components/ui/text'

export function ProfileView() {
  const { id } = useParams<{ id: string }>()
  const { profile, loading, error } = useProfile(id)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <DotWaveLoader />
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
      <TeacherProfileContent
        profile={profile}
        userId={profile.user_id}
      />
    )
  }

  if (role === USER_ROLES.STUDENT) {
    return <StudentProfileContent profile={profile} />
  }

  if (role === USER_ROLES.INSTITUTION_ADMIN) {
    return <InstitutionProfileContent institutionId={profile.user_id} />
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
