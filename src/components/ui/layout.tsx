import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { Container } from '../shared'
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <Container>
          <SidebarTrigger />
          {children}
        </Container>
      </main>
    </SidebarProvider>
  )
}
