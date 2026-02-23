import React from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellDot, LogOut, ChevronLeft } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import NotificationPanel from '@/features/notification/components/NotificationPanel'
import { LanguageSwitcher } from '../i18n/LanguageSwitcher'
import { useUser } from '@/contexts/user'
import { toast } from 'sonner'
import { Text } from '@/components/ui/text'
import { Badge } from '@/components/ui/badge'

interface AppNavigationProps {
  currentPageName?: string
  children?: React.ReactNode
  className?: string
  authenticated?: boolean
}

const AppNavigation = ({
  currentPageName,
  children,
  className,
  authenticated = true,
}: AppNavigationProps): React.ReactElement => {
  const navigate = useNavigate()
  const { logout } = useUser()
  const [notificationCount, setNotificationCount] = React.useState(0)

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
      className={cn('sticky top-0 z-40 w-full pointer-events-none', className)}
      style={{ ['--app-nav-height' as string]: '82px' }}
    >
      <div className="container mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4 pointer-events-none">
          <div className="flex items-center gap-3 rounded-full border bg-card/50 backdrop-blur px-4 py-2 shadow-sm pointer-events-auto">
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

          <div className="flex items-center gap-2 rounded-full border bg-card/50 backdrop-blur px-2 py-2 shadow-sm pointer-events-auto">
            <LanguageSwitcher />
            {authenticated && (
              <>
                <div className="h-6 w-px bg-border" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 rounded-full hover:bg-accent"
                    >
                      {notificationCount > 0 ? (
                        <BellDot className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Bell className="h-5 w-5 text-gray-600" />
                      )}
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums bg-[#FF015B] text-white hover:bg-[#FF015B]">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </Badge>
                      )}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-90 h-120 rounded-4xl backdrop-blur overflow-hidden mr-20 mt-4">
                    <NotificationPanel onTotalCountChange={setNotificationCount} />
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

export default AppNavigation
