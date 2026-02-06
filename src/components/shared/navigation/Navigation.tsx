import { Button } from '@/components/ui/button'
import { Bell, LogOut, ChevronLeft } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/utils'
import NotificationPanel from '@/features/notification/components/NotificationPanel'
import { LanguageSwitcher } from '../i18n/LanguageSwitcher'
import { useUser } from '@/contexts/user'
import { toast } from 'sonner'
import { Text } from '@/components/ui/text'

interface NavigationProps {
  currentPageName?: string
  children?: React.ReactNode
  className?: string
  authenticated?: boolean
}

const Navigation = ({
  currentPageName,
  children,
  className,
  authenticated = true,
}: NavigationProps) => {
  const navigate = useNavigate()
  const { logout } = useUser()

  const handleOnClickLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-40 w-full',

        className,
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section - Back button and Title */}
          <div className="flex items-center gap-3 rounded-full border bg-card/50 backdrop-blur px-4 py-2 shadow-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="h-8 w-8 rounded-full hover:bg-accent"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="h-6 w-px bg-border" />
            <Text
              as="h1"
              variant="h1"
              className="text-lg font-normal text-gray-700"
            >
              {children || currentPageName || 'Page Title'}
            </Text>
          </div>

          {/* Right Section - Language Switcher, Notification and Logout */}
          <div className="flex items-center gap-2 rounded-full border bg-card/50 backdrop-blur px-2 py-2 shadow-sm">
            <LanguageSwitcher />
            {authenticated && (
              <>
                <div className="h-6 w-px bg-border" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-accent"
                    >
                      <Bell className="h-5 w-5 text-gray-600" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-90 h-120 rounded-4xl backdrop-blur overflow-hidden mr-20 mt-4">
                    <NotificationPanel />
                  </PopoverContent>
                </Popover>
                <div className="h-6 w-px bg-border" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOnClickLogout}
                  className="h-10 w-10 rounded-full hover:bg-accent hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 text-gray-600" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation
