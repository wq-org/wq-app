import type { Course } from '@/features/course'

import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Text } from '@/components/ui/text'

type GameCourseSelectTableProps = {
  courses: readonly Course[]
  loading?: boolean
  selectedCourseId: string | null
  onSelectCourse: (courseId: string, checked: boolean) => void
  emptyLabel: string
  kursenameColumnLabel: string
  selectAllAriaLabel: string
  selectCourseAriaLabel: (title: string) => string
}

export function GameCourseSelectTable({
  courses,
  loading = false,
  selectedCourseId,
  onSelectCourse,
  emptyLabel,
  kursenameColumnLabel,
  selectAllAriaLabel,
  selectCourseAriaLabel,
}: GameCourseSelectTableProps) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border">
        <Spinner
          variant="gray"
          size="sm"
        />
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border px-4">
        <Text
          as="p"
          variant="small"
          className="text-center text-muted-foreground"
        >
          {emptyLabel}
        </Text>
      </div>
    )
  }

  return (
    <ScrollArea className="h-48 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <span className="sr-only">{selectAllAriaLabel}</span>
            </TableHead>
            <TableHead>{kursenameColumnLabel}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => {
            const checked = selectedCourseId === course.id
            const handleRowSelect = () => onSelectCourse(course.id, !checked)

            return (
              <TableRow
                key={course.id}
                data-state={checked ? 'selected' : undefined}
                className="cursor-pointer"
                onClick={handleRowSelect}
              >
                <TableCell onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => onSelectCourse(course.id, value === true)}
                    aria-label={selectCourseAriaLabel(course.title)}
                  />
                </TableCell>
                <TableCell>
                  <Text
                    as="span"
                    variant="small"
                    className="line-clamp-2"
                  >
                    {course.title}
                  </Text>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
