import type { ProgrammeOfferingStatus } from '../types/programme-offering.types'
import { createFaculty } from './facultiesApi'
import { createProgramme } from './programmesApi'
import { createProgrammeOffering } from './programmeOfferingsApi'
import { createCohort } from './cohortsApi'
import { createCohortOffering } from './cohortOfferingsApi'
import { createClassGroup } from './classGroupsApi'
import { createClassGroupOffering } from './classGroupOfferingsApi'
import type { ProgrammeRecord } from '../types/programme.types'
import type { ProgrammeOfferingRecord } from '../types/programme-offering.types'
import type { CohortOfferingRecord } from '../types/cohort-offering.types'
import type { ClassGroupOfferingRecord } from '../types/class-group-offering.types'

type DateRangeInput = {
  from?: Date
  to?: Date
}

type OfferingInput = {
  status: ProgrammeOfferingStatus
  dateRange?: DateRangeInput
}

export type CreateFacultyStructureInput = {
  institutionId: string
  faculty: {
    name: string
    description: string | null
  }
  programme: {
    name: string
    description: string | null
    durationYears: number | null
    progressionType: ProgrammeRecord['progression_type']
  }
  programmeOfferings: Array<
    {
      academicYear: number
      termCode: string | null
    } & OfferingInput
  >
  cohort: {
    name: string
    description: string | null
    academicYear: number | null
  }
  cohortOfferings: OfferingInput[]
  classGroup: {
    name: string
    description: string | null
  }
  classGroupOfferings: OfferingInput[]
}

export type CreateFacultyStructureResult = {
  facultyId: string
  programmeId: string
  cohortId: string
  classGroupId: string
  programmeOfferings: ProgrammeOfferingRecord[]
  cohortOfferings: CohortOfferingRecord[]
  classGroupOfferings: ClassGroupOfferingRecord[]
}

function toIsoDateOrNull(value: Date | undefined): string | null {
  return value ? value.toISOString() : null
}

export async function createFacultyStructure(
  input: CreateFacultyStructureInput,
): Promise<CreateFacultyStructureResult> {
  const faculty = await createFaculty({
    institution_id: input.institutionId,
    name: input.faculty.name.trim(),
    description: input.faculty.description,
  })

  const programme = await createProgramme({
    institution_id: input.institutionId,
    faculty_id: faculty.id,
    name: input.programme.name.trim(),
    description: input.programme.description,
    duration_years: input.programme.durationYears,
    progression_type: input.programme.progressionType,
  })

  const createdProgrammeOfferings: ProgrammeOfferingRecord[] = []
  for (const offering of input.programmeOfferings) {
    const row = await createProgrammeOffering({
      institution_id: input.institutionId,
      programme_id: programme.id,
      academic_year: offering.academicYear,
      term_code: offering.termCode,
      status: offering.status,
      starts_at: toIsoDateOrNull(offering.dateRange?.from),
      ends_at: toIsoDateOrNull(offering.dateRange?.to),
    })
    createdProgrammeOfferings.push(row)
  }

  const programmeOfferingAnchor = createdProgrammeOfferings[0]
  if (!programmeOfferingAnchor) {
    throw new Error('At least one programme offering is required')
  }

  const cohort = await createCohort({
    institution_id: input.institutionId,
    programme_id: programme.id,
    name: input.cohort.name.trim(),
    description: input.cohort.description,
    academic_year: input.cohort.academicYear,
  })

  const createdCohortOfferings: CohortOfferingRecord[] = []
  for (const [index, offering] of input.cohortOfferings.entries()) {
    const programmeOfferingId =
      createdProgrammeOfferings[Math.min(index, createdProgrammeOfferings.length - 1)]?.id ??
      programmeOfferingAnchor.id
    const row = await createCohortOffering({
      institution_id: input.institutionId,
      programme_offering_id: programmeOfferingId,
      cohort_id: cohort.id,
      status: offering.status,
      starts_at: toIsoDateOrNull(offering.dateRange?.from),
      ends_at: toIsoDateOrNull(offering.dateRange?.to),
    })
    createdCohortOfferings.push(row)
  }

  const cohortOfferingAnchor = createdCohortOfferings[0]
  if (!cohortOfferingAnchor) {
    throw new Error('At least one cohort offering is required')
  }

  const classGroup = await createClassGroup({
    institution_id: input.institutionId,
    cohort_id: cohort.id,
    name: input.classGroup.name.trim(),
    description: input.classGroup.description,
  })

  const createdClassGroupOfferings: ClassGroupOfferingRecord[] = []
  for (const [index, offering] of input.classGroupOfferings.entries()) {
    const cohortOfferingId =
      createdCohortOfferings[Math.min(index, createdCohortOfferings.length - 1)]?.id ??
      cohortOfferingAnchor.id
    const row = await createClassGroupOffering({
      institution_id: input.institutionId,
      cohort_offering_id: cohortOfferingId,
      class_group_id: classGroup.id,
      status: offering.status,
      starts_at: toIsoDateOrNull(offering.dateRange?.from),
      ends_at: toIsoDateOrNull(offering.dateRange?.to),
    })
    createdClassGroupOfferings.push(row)
  }

  return {
    facultyId: faculty.id,
    programmeId: programme.id,
    cohortId: cohort.id,
    classGroupId: classGroup.id,
    programmeOfferings: createdProgrammeOfferings,
    cohortOfferings: createdCohortOfferings,
    classGroupOfferings: createdClassGroupOfferings,
  }
}
