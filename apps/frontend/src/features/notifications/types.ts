export type NotificationData = {
  tutorialPeriodId: number
  title: string
  message: string
  registrationStartAt: string | null
  registrationEndAt: string | null
}

export type DbNotification = {
  id: string
  type: string
  data: NotificationData
  readAt: string | null
  createdAt: string
}
