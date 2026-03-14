import { useState, type ReactElement } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, BellDot, ChevronLeft, LogOut, Moon, Sun } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NotificationPanel } from '@/features/notification'
import { LanguageSwitcher } from '@/components/shared'
import { useUser } from '@/contexts/user'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/hooks/useTheme'

interface AppNavigationProps {
  className?: string
  authenticated?: boolean
}

export const AppNavigation = ({
  className,
  authenticated = true,
}: AppNavigationProps): ReactElement => {
  const navigate = useNavigate()
  const { logout } = useUser()
  const { mode, setMode } = useTheme()
  const [notificationCount, setNotificationCount] = useState(0)

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

  const handleToggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  return (
    <div
      className={cn('sticky top-0 z-40 w-full pointer-events-none', className)}
      style={{ ['--app-nav-height' as string]: '70px' }}
    >
      <div className="container py-3">
        <div className="flex items-center justify-between gap-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-card/90 px-2 py-2 text-foreground shadow-sm backdrop-blur supports-backdrop-filter:bg-card/75">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="h-8 w-8 rounded-full text-foreground hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border bg-card/90 px-2 py-2 text-foreground shadow-sm backdrop-blur supports-backdrop-filter:bg-card/75">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleMode}
              className="h-10 w-10 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="sr-only">
                {mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              </span>
            </Button>
            {authenticated && (
              <>
                <div className="h-6 w-px bg-border/80" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative h-10 w-10 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      {notificationCount > 0 ? (
                        <BellDot className="h-5 w-5" />
                      ) : (
                        <Bell className="h-5 w-5" />
                      )}
                      {notificationCount > 0 && (
                        <Badge className="absolute -top-2.5 -right-2.5 h-5 min-w-5 px-1 tabular-nums bg-[#FF015B] text-white hover:bg-[#FF015B]">
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </Badge>
                      )}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="mr-20 mt-4 h-120 w-90 overflow-hidden rounded-4xl border-border bg-popover/95 p-0 text-popover-foreground shadow-xl backdrop-blur supports-backdrop-filter:bg-popover/90">
                    <NotificationPanel onTotalCountChange={setNotificationCount} />
                  </PopoverContent>
                </Popover>
                <div className="h-6 w-px bg-border/80" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOnClickLogout}
                  className="rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
