import AdminDashboardLayout from '@/features/admin/components/AdminDashboardLayout'
import InstitutionForm from '../components/InstitutionForm'
export function CreateInstitution() {
  return (
    <AdminDashboardLayout>
      <div className="flex w-full items-center justify-center py-8">
        <InstitutionForm />
      </div>
    </AdminDashboardLayout>
  )
}


