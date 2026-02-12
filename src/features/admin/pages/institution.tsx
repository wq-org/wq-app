import AdminDashboardLayout from '@/features/admin/components/AdminDashboardLayout'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

export default function AdminInstitution() {
  return (
    <AdminDashboardLayout>
      <p>Institution</p>

      <Collapsible>
        <CollapsibleTrigger>Can I use this in my project?</CollapsibleTrigger>
        <CollapsibleContent>
          Yes. Free to use for personal and commercial projects. No attribution required.
        </CollapsibleContent>
      </Collapsible>
    </AdminDashboardLayout>
  )
}
