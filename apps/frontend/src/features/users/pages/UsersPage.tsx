import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { UserRoundX } from 'lucide-react'

import { UsersFilters } from '@/features/users/components/UsersFilters'
import { UsersTable } from '@/features/users/components/UsersTable'
import { useUsers } from '@/features/users/hooks'
import type { UserRole } from '@/features/users/types/user.types'
import { getApiErrorMessage } from '@/shared/api/errors'
import ErrorState from '@/shared/ui/error-state'
import {
  Empty,
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
    return [1, 'ellipsis', lastPage - 3, lastPage - 2, lastPage - 1, lastPage]
  }

  return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', lastPage]
}

export default function UsersPage() {
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL')

  const deferredSearch = useDeferredValue(searchInput)

  const usersQuery = useUsers({
    page,
    limit: pageSize,
    search: deferredSearch,
    role: roleFilter,
  })

  const users = usersQuery.data?.data ?? []
  const paginationMeta = usersQuery.data?.meta
  const lastPage = paginationMeta?.lastPage ?? 1
  const currentPage = paginationMeta?.currentPage ?? page
  const totalItems = paginationMeta?.total ?? 0

  const canGoPrevious = page > 1
  const canGoNext = page < lastPage
  const hasActiveFilters = deferredSearch.trim().length > 0 || roleFilter !== 'ALL'
  const paginationItems = useMemo(
    () => buildPaginationItems(currentPage, lastPage),
    [currentPage, lastPage]
  )
  const isInitialLoading = usersQuery.isPending && !usersQuery.data
  const isRefetching = usersQuery.isFetching && !!usersQuery.data

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
            Quản lý người dùng
          </h1>
        </div>

        <div className="pt-3">
          <UsersFilters
            searchInput={searchInput}
            roleFilter={roleFilter}
            onSearchChange={(value) => {
              setSearchInput(value)
              setPage(1)
            }}
            onRoleChange={(value) => {
              setRoleFilter(value)
              setPage(1)
            }}
          />
        </div>

        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          {isInitialLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          ) : usersQuery.isError ? (
            <ErrorState
              title="Không thể tải người dùng"
              description={getApiErrorMessage(usersQuery.error, 'Vui lòng thử lại sau.')}
            />
          ) : users.length === 0 ? (
            <Empty className="min-h-[18rem] rounded-xl border border-dashed border-slate-200 bg-slate-50/70">
              <EmptyHeader>
                <EmptyMedia variant="icon" className="size-10 rounded-xl bg-slate-100 text-slate-600">
                  <UserRoundX className="size-5" />
                </EmptyMedia>
                <EmptyTitle>
                  {hasActiveFilters ? 'Không tìm thấy người dùng' : 'Chưa có người dùng'}
                </EmptyTitle>
                <EmptyDescription className="max-w-md text-sm text-slate-500">
                  {hasActiveFilters
                    ? 'Thử đổi từ khóa tìm kiếm hoặc bộ lọc vai trò.'
                    : 'Danh sách người dùng sẽ hiển thị tại đây.'}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <UsersTable users={users} />
          )}
        </div>

        {users.length > 0 ? (
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
    </div>
  )
}
