import { Badge } from '@/components/ui/badge'
import Heart from '@/components/ui/heart'
import { Onboarding } from '@/features/onboarding'
export default function Test() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Badge
        hasDashedBorder={true}
        variant={'violet'}
      >
        yeah this answer is correct
      </Badge>

      <Onboarding />
      <Heart />
    </div>
  )
}
