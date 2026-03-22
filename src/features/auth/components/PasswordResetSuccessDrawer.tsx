import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import confetti from 'canvas-confetti'

interface PasswordResetSuccessDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PasswordResetSuccessDrawer({
  open,
  onOpenChange,
}: PasswordResetSuccessDrawerProps) {
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [open])

  const handleClose = () => {
    onOpenChange(false)
    navigate('/auth/login')
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent className="h-screen flex flex-col">
        <DrawerHeader className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <DrawerTitle className="text-2xl font-semibold">
            Password Changed Successfully!
          </DrawerTitle>
          <DrawerDescription className="mt-4 text-base">
            Your password has been updated. You are now logged in and can access your account.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="border-t">
          <Button
            onClick={handleClose}
            className="w-full"
            variant="darkblue"
            size="lg"
          >
            Go to Login
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
