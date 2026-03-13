import { Container } from '@/components/shared/container'

type DashboardContentProps = {
  children?: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  return <Container className="flex w-full px-0 flex-1 min-h-[420px]">{children}</Container>
}
