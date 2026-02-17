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
      <AppNavigation>
        <PageTitle />
      </AppNavigation>
      <Container className={cn(className)}>{children}</Container>
    </>
  )
}
