import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { CalendarSearch, CirclePlus } from 'lucide-react'

import {
  useCancelTutorialPeriodMutation,
  useCreateTutorialPeriodMutation,
  useDeleteTutorialPeriodMutation,
  useLegacyPeriods,
  useOpenTutorialPeriodMutation,
  useTutorialPeriods,
  useUpdateTutorialPeriodMutation,
} from '@/features/tutorial-period/hooks'
import { TutorialPeriodDeleteDialog } from '@/features/tutorial-period/components/TutorialPeriodDeleteDialog'
import { TutorialPeriodFilters } from '@/features/tutorial-period/components/TutorialPeriodFilters'
import { TutorialPeriodFormDialog } from '@/features/tutorial-period/components/TutorialPeriodFormDialog'
import { TutorialPeriodTable } from '@/features/tutorial-period/components/TutorialPeriodTable'
import {
  type TutorialPeriod,
  type TutorialPeriodStatus,
} from '@/features/tutorial-period/types/tutorialPeriod.types'
import type { TutorialPeriodFormValues } from '@/features/tutorial-period/schemas/tutorialPeriod.schema'
import { getApiErrorMessage } from '@/shared/api/errors'
import { Button } from '@/shared/ui/button'
import ErrorState from '@/shared/ui/error-state'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/shared/ui/empty'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'
import { Spinner } from '@/shared/ui/spinner'

const pageSize = 10

const buildPaginationItems = (
  currentPage: number,
  lastPage: number
): Array<number | 'ellipsis'> => {
  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis', lastPage]
  }

  if (currentPage >= lastPage - 2) {
    return [
      1,
      'ellipsis',
      lastPage - 3,
      lastPage - 2,
      lastPage - 1,
      lastPage,
    ]
  }

  return [
    1,
    'ellipsis',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis',
    lastPage,
  ]
}

export default function TutorialPeriodListPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<TutorialPeriodStatus | 'ALL'>('ALL')
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [selectedTutorialPeriod, setSelectedTutorialPeriod] = useState<TutorialPeriod | null>(null)
  const [tutorialPeriodToDelete, setTutorialPeriodToDelete] = useState<TutorialPeriod | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const deferredSearch = useDeferredValue(searchInput)

  const tutorialPeriodsQuery = useTutorialPeriods({
    page,
    limit: pageSize,
    search: deferredSearch,
    status: statusFilter,
  })
  const legacyPeriodsQuery = useLegacyPeriods()
  const createMutation = useCreateTutorialPeriodMutation()
  const updateMutation = useUpdateTutorialPeriodMutation()
  const deleteMutation = useDeleteTutorialPeriodMutation()
  const openMutation = useOpenTutorialPeriodMutation()
  const cancelMutation = useCancelTutorialPeriodMutation()

  const tutorialPeriods = tutorialPeriodsQuery.data?.data ?? []
  const legacyPeriods = legacyPeriodsQuery.data?.data ?? []
  const paginationMeta = tutorialPeriodsQuery.data?.meta
  const lastPage = paginationMeta?.lastPage ?? 1
  const currentPage = paginationMeta?.currentPage ?? page
  const totalItems = paginationMeta?.total ?? 0

  const isFormSubmitting = createMutation.isPending || updateMutation.isPending

  const dialogTutorialPeriod = useMemo(
    () => (dialogMode === 'edit' ? selectedTutorialPeriod : null),
    [dialogMode, selectedTutorialPeriod]
  )

  const openCreateDialog = () => {
    setFormError(null)
    setActionError(null)
    setDialogMode('create')
    setSelectedTutorialPeriod(null)
    setIsFormDialogOpen(true)
  }

  const openEditDialog = (tutorialPeriod: TutorialPeriod) => {
    setFormError(null)
    setActionError(null)
    setDialogMode('edit')
    setSelectedTutorialPeriod(tutorialPeriod)
    setIsFormDialogOpen(true)
  }

  const closeFormDialog = (open: boolean) => {
    setIsFormDialogOpen(open)

    if (!open) {
      setFormError(null)
      setSelectedTutorialPeriod(null)
      setDialogMode('create')
    }
  }

  const handleSubmitForm = async (values: TutorialPeriodFormValues) => {
    setFormError(null)

    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync(values)
      } else if (selectedTutorialPeriod) {
        await updateMutation.mutateAsync({
          tutorialPeriodId: selectedTutorialPeriod.id,
          payload: values,
        })
      }

      closeFormDialog(false)
    } catch (error) {
      setFormError(
        getApiErrorMessage(error, 'Không thể lưu đợt phụ đạo. Vui lòng thử lại.')
      )
    }
  }

  const handleOpenTutorialPeriod = async (tutorialPeriod: TutorialPeriod) => {
    setActionError(null)

    try {
      await openMutation.mutateAsync(tutorialPeriod.id)
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'Không thể mở đợt phụ đạo. Vui lòng thử lại.')
      )
    }
  }

  const handleCancelTutorialPeriod = async (tutorialPeriod: TutorialPeriod) => {
    setActionError(null)

    try {
      await cancelMutation.mutateAsync(tutorialPeriod.id)
    } catch (error) {
      setActionError(
        getApiErrorMessage(error, 'Không thể hủy đợt phụ đạo. Vui lòng thử lại.')
      )
    }
  }

  const handleDelete = async () => {
    if (!tutorialPeriodToDelete) {
      return
    }

    setDeleteError(null)

    try {
      await deleteMutation.mutateAsync(tutorialPeriodToDelete.id)
      setTutorialPeriodToDelete(null)
    } catch (error) {
      setDeleteError(
        getApiErrorMessage(error, 'Không thể xóa đợt phụ đạo. Vui lòng thử lại.')
      )
    }
  }

  const canGoPrevious = page > 1
  const canGoNext = page < lastPage
  const hasActiveFilters = deferredSearch.trim().length > 0 || statusFilter !== 'ALL'
  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, lastPage),
    [currentPage, lastPage]
  )
  const isInitialLoading = tutorialPeriodsQuery.isPending && !tutorialPeriodsQuery.data
  const isRefetching = tutorialPeriodsQuery.isFetching && !!tutorialPeriodsQuery.data

  useEffect(() => {
    if (page === 1) {
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page || nextPage < 1 || nextPage > lastPage) {
      return
    }

    setPage(nextPage)
  }

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="border-b border-slate-200 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Quản lý đợt phụ đạo
          </h1>
        </div>

        <div className="flex flex-col gap-3 pt-3 lg:flex-row lg:items-center lg:justify-between">
          <TutorialPeriodFilters
            searchInput={searchInput}
            statusFilter={statusFilter}
            onSearchChange={(value) => {
              setSearchInput(value)
              setPage(1)
            }}
            onStatusChange={(value) => {
              setStatusFilter(value)
              setPage(1)
            }}
          />

          <Button className="lg:min-w-24" onClick={openCreateDialog}>
            Tạo
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
              title="Không thể tải đợt học"
              description={getApiErrorMessage(
                tutorialPeriodsQuery.error,
                'Vui lòng thử lại sau.'
              )}
            />
          ) : tutorialPeriods.length === 0 ? (
            <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-10 rounded-xl bg-slate-100 text-slate-600">
                  <CalendarSearch className="size-5" />
                </EmptyMedia>
                <EmptyTitle>
                  {hasActiveFilters
                    ? 'Không tìm thấy đợt học'
                    : 'Chưa có đợt học'}
                </EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  {hasActiveFilters
                    ? 'Thử đổi bộ lọc hoặc tạo đợt phụ đạo mới.'
                    : 'Tạo đợt phụ đạo đầu tiên để bắt đầu quản lý.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={openCreateDialog}>
                  <CirclePlus className="size-4" />
                  Tạo
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <TutorialPeriodTable
              tutorialPeriods={tutorialPeriods}
              onEdit={openEditDialog}
              onDelete={setTutorialPeriodToDelete}
              onOpen={(tutorialPeriod) => {
                void handleOpenTutorialPeriod(tutorialPeriod)
              }}
              onCancel={(tutorialPeriod) => {
                void handleCancelTutorialPeriod(tutorialPeriod)
              }}
            />
          )}
        </div>

        {tutorialPeriods.length > 0 ? (
          <div className="mt-auto flex flex-col gap-3 border-t border-slate-200 pt-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <span>
                Trang {currentPage} / {lastPage}
              </span>
              <span className="hidden text-slate-300 sm:inline">•</span>
              <span>{totalItems} kết quả</span>
              {isRefetching ? (
                <span className="inline-flex items-center gap-2 text-[#0f4c81]">
                  <Spinner size="sm" className="text-[#0f4c81]" />
                  Đang cập nhật
                </span>
              ) : null}
            </div>

            <Pagination className="mx-0 w-auto justify-start lg:justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    text="Trước"
                    aria-disabled={!canGoPrevious}
                    className={!canGoPrevious ? 'pointer-events-none opacity-50' : ''}
                    onClick={(event) => {
                      event.preventDefault()
                      handlePageChange(page - 1)
                    }}
                  />
                </PaginationItem>

                {paginationItems.map((item, index) => (
                  <PaginationItem key={`${item}-${index}`}>
                    {item === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={item === currentPage}
                        onClick={(event) => {
                          event.preventDefault()
                          handlePageChange(item)
                        }}
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    text="Sau"
                    aria-disabled={!canGoNext}
                    className={!canGoNext ? 'pointer-events-none opacity-50' : ''}
                    onClick={(event) => {
                      event.preventDefault()
                      handlePageChange(page + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        ) : null}
      </div>

      <TutorialPeriodFormDialog
        mode={dialogMode}
        open={isFormDialogOpen}
        tutorialPeriod={dialogTutorialPeriod}
        legacyPeriods={legacyPeriods}
        isLegacyPeriodsLoading={legacyPeriodsQuery.isLoading}
        legacyPeriodsError={
          legacyPeriodsQuery.isError
            ? getApiErrorMessage(
                legacyPeriodsQuery.error,
                'Không thể tải danh sách học kỳ từ hệ thống cũ.'
              )
            : null
        }
        isSubmitting={isFormSubmitting}
        submitError={formError}
        onOpenChange={closeFormDialog}
        onSubmit={handleSubmitForm}
      />

      {deleteError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {deleteError}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {actionError}
        </div>
      ) : null}

      <TutorialPeriodDeleteDialog
        tutorialPeriod={tutorialPeriodToDelete}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          void handleDelete()
        }}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteError(null)
            setTutorialPeriodToDelete(null)
          }
        }}
      />
    </div>
  )
}
