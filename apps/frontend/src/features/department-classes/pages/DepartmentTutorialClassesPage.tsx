import { useEffect, useMemo, useState } from 'react'
import { LayoutList, Plus } from 'lucide-react'
import { toast } from 'sonner'

import {
  useAssignDepartmentTutorialClassLecturerMutation,
  useCancelDepartmentTutorialClassMutation,
  useCreateDepartmentTutorialClassMutation,
  useDepartmentTutorialClasses,
  useDepartmentRooms,
  useRestoreDepartmentTutorialClassMutation,
  useUpdateDepartmentTutorialClassMutation,
} from '@/features/department-classes/hooks'
import { AssignLecturerDialog } from '@/features/department-classes/components/AssignLecturerDialog'
import { CancelTutorialClassDialog } from '@/features/department-classes/components/CancelTutorialClassDialog'
import { CreateTutorialClassDialog } from '@/features/department-classes/components/CreateTutorialClassDialog'
import { EditTutorialClassDialog } from '@/features/department-classes/components/EditTutorialClassDialog'
import { ManageScheduleDialog } from '@/features/department-classes/components/ManageScheduleDialog'
import { RestoreTutorialClassDialog } from '@/features/department-classes/components/RestoreTutorialClassDialog'
import { TutorialClassesTable } from '@/features/department-classes/components/TutorialClassesTable'
import type { DepartmentTutorialClass } from '@/features/department-classes/types/departmentTutorialClass.types'
import {
  useDepartmentCourseRegistrationSummary,
  useDepartmentTutorialPeriods,
} from '@/features/department-registration/hooks'
import type { DepartmentTutorialPeriodOption } from '@/features/department-registration/types/departmentTutorialRegistration.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import ErrorState from '@/shared/ui/error-state'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

export default function DepartmentTutorialClassesPage() {
  const [selectedTutorialPeriodId, setSelectedTutorialPeriodId] = useState<number | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingClass, setEditingClass] = useState<DepartmentTutorialClass | null>(null)
  const [assigningLecturerClass, setAssigningLecturerClass] = useState<DepartmentTutorialClass | null>(null)
  const [managingScheduleClass, setManagingScheduleClass] = useState<DepartmentTutorialClass | null>(null)
  const [cancellingClass, setCancellingClass] = useState<DepartmentTutorialClass | null>(null)
  const [restoringClass, setRestoringClass] = useState<DepartmentTutorialClass | null>(null)

  const tutorialPeriodsQuery = useDepartmentTutorialPeriods()
  const tutorialPeriods = tutorialPeriodsQuery.data?.data ?? []

  const classesQuery = useDepartmentTutorialClasses(selectedTutorialPeriodId)
  const classes = classesQuery.data?.data ?? []
  const roomsQuery = useDepartmentRooms()
  const rooms = roomsQuery.data?.data ?? []

  const courseSummaryQuery = useDepartmentCourseRegistrationSummary(selectedTutorialPeriodId)
  const courseSummary = courseSummaryQuery.data?.data ?? []

  const createClassMutation = useCreateDepartmentTutorialClassMutation()
  const updateClassMutation = useUpdateDepartmentTutorialClassMutation()
  const assignLecturerMutation = useAssignDepartmentTutorialClassLecturerMutation()
  const cancelClassMutation = useCancelDepartmentTutorialClassMutation()
  const restoreClassMutation = useRestoreDepartmentTutorialClassMutation()

  useEffect(() => {
    if (tutorialPeriods.length === 0) {
      setSelectedTutorialPeriodId(null)
      return
    }

    const hasCurrentSelection = tutorialPeriods.some(
      (tutorialPeriod) => tutorialPeriod.id === selectedTutorialPeriodId
    )

    if (!hasCurrentSelection) {
      setSelectedTutorialPeriodId(tutorialPeriods[0].id)
    }
  }, [tutorialPeriods, selectedTutorialPeriodId])

  const selectedTutorialPeriod = useMemo(
    () =>
      tutorialPeriods.find(
        (tutorialPeriod) => tutorialPeriod.id === selectedTutorialPeriodId
      ) ?? null,
    [selectedTutorialPeriodId, tutorialPeriods]
  )

  const isInitialLoading = tutorialPeriodsQuery.isPending && !tutorialPeriodsQuery.data
  const canCreateClass =
    selectedTutorialPeriod?.status === 'ASSIGNING' &&
    courseSummary.some(
      (course) => !classes.some((tutorialClass) => tutorialClass.courseCode === course.courseCode)
    )

  const handleCreateClass = async (payload: {
    courseCode: string
    totalSessions: number
    periodsPerSession: number
  }) => {
    if (!selectedTutorialPeriodId) {
      return
    }

    try {
      await createClassMutation.mutateAsync({
        tutorialPeriodId: selectedTutorialPeriodId,
        payload,
      })
      setIsCreateDialogOpen(false)
      toast.success('Tạo lớp phụ đạo thành công.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể tạo lớp phụ đạo.'))
      throw error
    }
  }

  const handleUpdateClass = async (payload: {
    totalSessions: number
    periodsPerSession: number
  }) => {
    if (!editingClass || !selectedTutorialPeriodId) {
      return
    }

    try {
      await updateClassMutation.mutateAsync({
        classId: editingClass.id,
        tutorialPeriodId: selectedTutorialPeriodId,
        payload,
      })
      setEditingClass(null)
      toast.success('Cập nhật lớp phụ đạo thành công.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể cập nhật lớp phụ đạo.'))
      throw error
    }
  }

  const handleCancelClass = async () => {
    if (!cancellingClass || !selectedTutorialPeriodId) {
      return
    }

    try {
      await cancelClassMutation.mutateAsync({
        classId: cancellingClass.id,
        tutorialPeriodId: selectedTutorialPeriodId,
      })
      setCancellingClass(null)
      toast.success('Hủy lớp phụ đạo thành công.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể hủy lớp phụ đạo.'))
      throw error
    }
  }

  const handleRestoreClass = async () => {
    if (!restoringClass || !selectedTutorialPeriodId) {
      return
    }

    try {
      await restoreClassMutation.mutateAsync({
        classId: restoringClass.id,
        tutorialPeriodId: selectedTutorialPeriodId,
      })
      setRestoringClass(null)
      toast.success('Khôi phục lớp phụ đạo thành công.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể khôi phục lớp phụ đạo.'))
      throw error
    }
  }

  const handleAssignLecturer = async (payload: { lecturerId: number }) => {
    if (!assigningLecturerClass || !selectedTutorialPeriodId) {
      return
    }

    try {
      await assignLecturerMutation.mutateAsync({
        classId: assigningLecturerClass.id,
        tutorialPeriodId: selectedTutorialPeriodId,
        payload,
      })
      setAssigningLecturerClass(null)
      toast.success('Phân công giảng viên thành công.')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Không thể phân công giảng viên.'))
      throw error
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Lớp phụ đạo
          </h1>
        </div>

        <div className="flex flex-col gap-3 pt-3 md:flex-row md:items-end md:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Đợt phụ đạo
            </label>
            <Select
              value={selectedTutorialPeriodId?.toString() ?? ''}
              onValueChange={(value) => setSelectedTutorialPeriodId(Number(value))}
              disabled={tutorialPeriods.length === 0}
            >
              <SelectTrigger className="h-9 w-full md:w-[460px] lg:w-[520px]">
                <SelectValue placeholder="Chọn đợt phụ đạo" />
              </SelectTrigger>
              <SelectContent>
                {tutorialPeriods.map((tutorialPeriod: DepartmentTutorialPeriodOption) => (
                  <SelectItem
                    key={tutorialPeriod.id}
                    value={tutorialPeriod.id.toString()}
                  >
                    {tutorialPeriod.academicPeriod?.name
                      ? `${tutorialPeriod.academicPeriod.name} · ${tutorialPeriod.title}`
                      : tutorialPeriod.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="md:min-w-24"
            onClick={() => setIsCreateDialogOpen(true)}
            disabled={!canCreateClass}
          >
            <Plus className="size-4" />
            Tạo lớp
          </Button>
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          {isInitialLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : tutorialPeriodsQuery.isError ? (
            <ErrorState
              title="Không thể tải đợt phụ đạo"
              description={getApiErrorMessage(
                tutorialPeriodsQuery.error,
                'Vui lòng thử lại sau.'
              )}
            />
          ) : tutorialPeriods.length === 0 ? (
            <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-10 rounded-xl bg-slate-100 text-slate-600"
                >
                  <LayoutList className="size-5" />
                </EmptyMedia>
                <EmptyTitle>Chưa có đợt phụ đạo phù hợp</EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  Danh sách đợt phụ đạo dành cho bộ môn sẽ hiển thị tại đây.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : classesQuery.isPending && !classesQuery.data ? (
            <div className="space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : classesQuery.isError ? (
            <ErrorState
              title="Không thể tải lớp phụ đạo"
              description={getApiErrorMessage(
                classesQuery.error,
                'Vui lòng thử lại sau.'
              )}
            />
          ) : (
            <TutorialClassesTable
              classes={classes}
              canManage={selectedTutorialPeriod?.status === 'ASSIGNING'}
              onAssignLecturer={setAssigningLecturerClass}
              onManageSchedules={setManagingScheduleClass}
              onEdit={setEditingClass}
              onCancel={setCancellingClass}
              onRestore={setRestoringClass}
            />
          )}
        </div>
      </div>

      <CreateTutorialClassDialog
        open={isCreateDialogOpen}
        courseOptions={courseSummary}
        existingClasses={classes}
        isSubmitting={createClassMutation.isPending}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateClass}
      />
      <EditTutorialClassDialog
        tutorialClass={editingClass}
        isSubmitting={updateClassMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setEditingClass(null)
          }
        }}
        onSubmit={handleUpdateClass}
      />
      <AssignLecturerDialog
        tutorialClass={assigningLecturerClass}
        isSubmitting={assignLecturerMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setAssigningLecturerClass(null)
          }
        }}
        onSubmit={handleAssignLecturer}
      />
      <ManageScheduleDialog
        tutorialClass={managingScheduleClass}
        tutorialPeriodId={selectedTutorialPeriodId}
        rooms={rooms}
        roomsLoading={roomsQuery.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setManagingScheduleClass(null)
          }
        }}
      />
      <CancelTutorialClassDialog
        tutorialClass={cancellingClass}
        isSubmitting={cancelClassMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setCancellingClass(null)
          }
        }}
        onConfirm={handleCancelClass}
      />
      <RestoreTutorialClassDialog
        tutorialClass={restoringClass}
        isSubmitting={restoreClassMutation.isPending}
        onOpenChange={(open) => {
          if (!open) {
            setRestoringClass(null)
          }
        }}
        onConfirm={handleRestoreClass}
      />
    </div>
  )
}
