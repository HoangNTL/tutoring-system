export type StudentTutorialPeriod = {
  id: number
  academicPeriodId: number | null
  academicPeriod: {
    id: number
    name: string
  } | null
  title: string
  description: string | null
  registrationStartAt: string | null
  registrationEndAt: string | null
  studyStartAt: string | null
  studyEndAt: string | null
  status: 'OPEN'
}
