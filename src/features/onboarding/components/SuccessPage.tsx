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

interface SuccessPageProps {
  isOpen: boolean
  title?: string
  description?: string
  onClickHandler?: () => void
}

export function SuccessPage({
  isOpen,
  title = 'Welcome to WQ Health!',
  description = 'Your account has been set up successfully. You are now ready to start your journey with us.',
  onClickHandler,
}: SuccessPageProps) {
  const navigate = useNavigate()
  const { profile, pendingRole } = useUser()

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
    // Navigate to role-specific dashboard
    // Use profile.role first (from refreshed profile), then fallback to pendingRole
    const role = profile?.role || pendingRole

    if (role) {
      navigate(getDashboardPathForRole(role as UserRole))
    } else if (onClickHandler) {
      // Fallback to onClickHandler if no role is available
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
