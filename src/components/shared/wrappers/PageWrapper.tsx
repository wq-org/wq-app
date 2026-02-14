import { AppNavigation } from '../navigation'
import { PageTitle } from '@/components/layout/PageTitle'
import { Container } from '../container'
import { cn } from '@/lib/utils'

export default function PageWrapper({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <>
      <div>
        <AppNavigation>
          <PageTitle />
        </AppNavigation>
        <div className="flex flex-col gap-8"></div>
        <Container className={cn(className)}>{children}</Container>
      </div>
    </>
  )
}
