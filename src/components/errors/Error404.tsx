import { Ghost, ArrowLeft, HomeIcon, LogIn } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@/contexts/user'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { Text } from '@/components/ui/text'

const Error404 = () => {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const role = getRole()

  const handleGoBack = () => {
    window.history.back()
  }

  const handleGoToDashboard = () => {
    if (role) {
      navigate(`/${role}/dashboard`)
    } else {
      navigate('/')
    }
  }

  const handleGoToLogin = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="text-center max-w-xl">
        <Ghost
          className="w-32 h-32 mx-auto mb-8 text-black animate-bounce"
          strokeWidth={1.5}
        />

        <Text as="h1" variant="h1" className="text-6xl  text-black mb-4">404</Text>

        <Text as="h2" variant="h2" className="text-2xl font-semibold text-black mb-6">Page Not Found</Text>

        <Text as="p" variant="body" className="text-gray-700 mb-8 px-4">
          Oops! Looks like you've ventured into uncharted territory. The page you're looking for
          seems to have gone exploring.
        </Text>

        {/* Navigation options with circular icon buttons */}
        <div className="flex items-center justify-center gap-6">
          {/* Go Back Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleGoBack}
                className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <Text as="p" variant="body">Go Back</Text>
            </TooltipContent>
          </Tooltip>

          {/* Dashboard Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleGoToDashboard}
                className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Go to dashboard"
              >
                <HomeIcon className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <Text as="p" variant="body">Go to Dashboard</Text>
            </TooltipContent>
          </Tooltip>

          {/* Login Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleGoToLogin}
                className="w-14 h-14 rounded-full bg-white text-black border-2 border-black flex items-center justify-center hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Go to login"
              >
                <LogIn className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <Text as="p" variant="body">Go to Login</Text>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

export default Error404