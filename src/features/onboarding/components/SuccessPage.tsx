import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { Text } from '@/components/ui/text'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useUser } from '@/contexts/user'
import { getDashboardPathForRole, type UserRole } from '@/features/auth/'
import { logRoleDebug } from '@/features/auth/utils/roleDebugLog'

interface SuccessPageProps {
  isOpen: boolean
  /** Role chosen when onboarding finished; wins over context so navigation matches what was saved. */
  dashboardRole?: string | null
  title?: string
  description?: string
  onClickHandler?: () => void
}

export function SuccessPage({
  isOpen,
  dashboardRole = null,
  title = 'Welcome to WQ Health!',
  description = 'Your account has been set up successfully. You are now ready to start your journey with us.',
  onClickHandler,
}: SuccessPageProps) {
  const navigate = useNavigate()
  const { profile } = useUser()

  // Trigger confetti on open
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [isOpen])

  const handleDone = () => {
    const trimmedDashboard = dashboardRole?.trim() ?? ''
    const trimmedProfile = profile?.role?.trim() ?? ''
    const role = trimmedDashboard

    logRoleDebug('SuccessPage Done click', {
      dashboardRole: trimmedDashboard || '(empty)',
      profileRole: trimmedProfile || '(empty)',
      resolvedRole: role || '(none)',
      navigateTo: role ? getDashboardPathForRole(role as UserRole) : 'onClickHandler or /',
    })

    if (role) {
      navigate(getDashboardPathForRole(role as UserRole))
    } else if (onClickHandler) {
      onClickHandler()
    } else {
      navigate('/')
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {}}
    >
      <DialogContent
        className="sm:max-w-md text-center"
        showCloseButton={false}
      >
        {/* Party Emoji */}
        <div className="flex justify-center py-4">
          <Text
            as="span"
            variant="small"
            className="text-6xl animate-bounce"
          >
            🎉
          </Text>
        </div>

        <DialogHeader>
          <DialogTitle className="text-2xl font-light">{title}</DialogTitle>
          <DialogDescription className="text-base mt-2">{description}</DialogDescription>
        </DialogHeader>

        {/* Done Button */}
        <div className="flex justify-center pt-4">
          <Button
            type="button"
            variant="default"
            size="lg"
            onClick={handleDone}
            className="w-full"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
