import Navigation from '@/components/common/Navigation'
import { PageTitle } from '../layout/PageTitle'
import Container from './Container'
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
        <Navigation>
          <PageTitle />
        </Navigation>
        <div className="flex flex-col gap-8"></div>
        <Container className={cn(className)}>{children}</Container>
      </div>
    </>
  )
}
