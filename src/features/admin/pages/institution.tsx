import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AdminDashboardLayout from '@/features/admin/components/AdminDashboardLayout'
import { fetchInstitutions } from '../api/institutionApi'
import { useUser } from '@/contexts/user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Spinner from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { InstitutionStatus } from '../types/institution.types'

interface InstitutionRow {
  id: string
  name: string
  slug: string | null
  type: string | null
  status: string | null
  created_at: string
}

const STATUS_VARIANT: Record<InstitutionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  pending: 'outline',
  inactive: 'secondary',
  suspended: 'destructive',
}

export default function AdminInstitution() {
  const navigate = useNavigate()
  const { getRole } = useUser()
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([])
  const [loading, setLoading] = useState(true)

  const role = getRole()

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchInstitutions()
        setInstitutions(data ?? [])
      } catch (err) {
        toast.error('Failed to Load Institutions', {
          description: err instanceof Error ? err.message : 'An unexpected error occurred.',
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col gap-6 py-8 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Institutions</h1>
          <Button variant="outline"

           onClick={() => navigate(`/${role}/institution/new-institution`)}>
            New Institution
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[300px]">
            <Spinner
              variant="gray"
              size="sm"
              speed={1750}
            />
          </div>
        ) : institutions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-2 text-center">
            <p className="text-muted-foreground text-sm">No institutions found.</p>
            <Button
              variant="outline"
              onClick={() => navigate(`/${role}/dashboard/new-institution`)}
            >
              Create your first institution
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {institutions.map((inst) => (
                  <TableRow key={inst.id}>
                    <TableCell className="font-medium">{inst.slug ?? '—'}</TableCell>
                    <TableCell className="capitalize">{inst.type ?? '—'}</TableCell>
                    <TableCell>
                      {inst.status ? (
                        <Badge variant={STATUS_VARIANT[inst.status as InstitutionStatus] ?? 'outline'}>
                          {inst.status}
                        </Badge>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
