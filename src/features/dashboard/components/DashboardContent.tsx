type DashboardContentProps = {
  children?: React.ReactNode
}

export function DashboardContent({ children }: DashboardContentProps) {
  return <div className="flex w-full flex-1 min-h-[420px]">{children}</div>
}
