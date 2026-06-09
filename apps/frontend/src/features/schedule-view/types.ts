export type UserScheduleItem = {
  id: number
  classId: number | null
  tutorialPeriodId: number | null
  tutorialPeriodTitle: string | null
  courseCode: string
  courseName: string
  lecturerId: number | null
  lecturerName: string
  roomCode: string
  roomName: string
  dayOfWeek: number
  startPeriod: number
  endPeriod: number
  studyStartAt: string | null
  studyEndAt: string | null
}
