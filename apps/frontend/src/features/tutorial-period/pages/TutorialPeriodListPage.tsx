import { useDeferredValue, useMemo, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCreateTutorialPeriodMutation,
  useDeleteTutorialPeriodMutation,
  useTutorialPeriods,
  useUpdateTutorialPeriodMutation,
} from '@/features/tutorial-period/hooks'
import { TutorialPeriodFormDialog } from '@/features/tutorial-period/components/TutorialPeriodFormDialog'
import { TutorialPeriodTable } from '@/features/tutorial-period/components/TutorialPeriodTable'
import {
  tutorialPeriodStatuses,
  type CreateTutorialPeriodPayload,
  type TutorialPeriod,
  type TutorialPeriodPayload,
  type TutorialPeriodStatus,
} from '@/features/tutorial-period/types'
import { useAppSelector } from '@/store/hooks'

const pageSize = 10

export default function TutorialPeriodListPage() {
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<TutorialPeriodStatus | 'ALL'>('ALL')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [selectedTutorialPeriod, setSelectedTutorialPeriod] = useState<TutorialPeriod | null>(null)
  const [tutorialPeriodToDelete, setTutorialPeriodToDelete] = useState<TutorialPeriod | null>(null)

  const deferredSearch = useDeferredValue(searchInput)

  const tutorialPeriodsQuery = useTutorialPeriods({
    page,
    limit: pageSize,
    search: deferredSearch,
    status: statusFilter,
  })
  const createMutation = useCreateTutorialPeriodMutation()
  const updateMutation = useUpdateTutorialPeriodMutation()
  const deleteMutation = useDeleteTutorialPeriodMutation()

  const tutorialPeriods = tutorialPeriodsQuery.data?.data ?? []
  const paginationMeta = tutorialPeriodsQuery.data?.meta

  const isFormSubmitting =
    createMutation.isPending || updateMutation.isPending

  const dialogTutorialPeriod = useMemo(
    () => (dialogMode === 'edit' ? selectedTutorialPeriod : null),
    [dialogMode, selectedTutorialPeriod]
  )

  const openCreateDialog = () => {
    setDialogMode('create')
    setSelectedTutorialPeriod(null)
    setIsFormDialogOpen(true)
  }

  const openEditDialog = (tutorialPeriod: TutorialPeriod) => {
    setDialogMode('edit')
    setSelectedTutorialPeriod(tutorialPeriod)
    setIsFormDialogOpen(true)
  }

  const closeFormDialog = (open: boolean) => {
    setIsFormDialogOpen(open)

    if (!open) {
      setSelectedTutorialPeriod(null)
      setDialogMode('create')
    }
  }

  const handleSubmitForm = async (values: TutorialPeriodPayload) => {
    if (dialogMode === 'create') {
      if (!currentUserId) {
        throw new Error('Missing user_id for tutorial period creation')
      }

      const createPayload: CreateTutorialPeriodPayload = {
        ...values,
        user_id: currentUserId,
      }

      await createMutation.mutateAsync(createPayload)
    } else if (selectedTutorialPeriod) {
      await updateMutation.mutateAsync({
        tutorialPeriodId: selectedTutorialPeriod.id,
        payload: values,
      })
    }

    closeFormDialog(false)
  }

  const handleDelete = async () => {
    if (!tutorialPeriodToDelete) {
      return
    }

    await deleteMutation.mutateAsync(tutorialPeriodToDelete.id)
    setTutorialPeriodToDelete(null)
  }

  const canGoPrevious = page > 1
  const canGoNext = page < (paginationMeta?.lastPage ?? 1)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
            Admin Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Quản lý đợt phụ đạo
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Quản lý toàn bộ đợt phụ đạo trong một màn hình, bao gồm tìm kiếm, lọc, tạo mới, cập nhật và xóa.
          </p>
        </div>

        <Button size="lg" onClick={openCreateDialog}>
          Tạo đợt phụ đạo
        </Button>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <Input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value)
                setPage(1)
              }}
              placeholder="Tìm theo tiêu đề đợt phụ đạo"
              className="h-10 md:max-w-md"
            />

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as TutorialPeriodStatus | 'ALL')
                setPage(1)
              }}
            >
              <SelectTrigger className="h-10 min-w-44">
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {tutorialPeriodStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {paginationMeta ? (
            <p className="text-sm text-slate-500">
              Tổng {paginationMeta.total} đợt phụ đạo
            </p>
          ) : null}
        </div>

        <div className="mt-5">
          {tutorialPeriodsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : tutorialPeriodsQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-600">
              Không thể tải danh sách đợt phụ đạo. Vui lòng thử lại.
            </div>
          ) : (
            <TutorialPeriodTable
              tutorialPeriods={tutorialPeriods}
              onCreate={openCreateDialog}
              onEdit={openEditDialog}
              onDelete={setTutorialPeriodToDelete}
            />
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Trang {paginationMeta?.currentPage ?? page} / {paginationMeta?.lastPage ?? 1}
          </p>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
              disabled={!canGoPrevious}
            >
              Trang trước
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPage((currentPage) => currentPage + 1)}
              disabled={!canGoNext}
            >
              Trang sau
            </Button>
          </div>
        </div>
      </div>

      <TutorialPeriodFormDialog
        mode={dialogMode}
        open={isFormDialogOpen}
        tutorialPeriod={dialogTutorialPeriod}
        isSubmitting={isFormSubmitting}
        onOpenChange={closeFormDialog}
        onSubmit={handleSubmitForm}
      />

      <AlertDialog
        open={tutorialPeriodToDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setTutorialPeriodToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa đợt phụ đạo</AlertDialogTitle>
            <AlertDialogDescription>
              {tutorialPeriodToDelete
                ? `Bạn có chắc chắn muốn xóa "${tutorialPeriodToDelete.title}" không? Hành động này chỉ áp dụng cho đợt ở trạng thái DRAFT.`
                : 'Xác nhận xóa đợt phụ đạo.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault()
                void handleDelete()
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
