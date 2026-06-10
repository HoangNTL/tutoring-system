<?php

namespace App\Services\Support;

use App\Traits\PaginationHelper;
use Illuminate\Database\Eloquent\Builder;

abstract class AbstractPaginatedQueryService
{
    use PaginationHelper;

    public function getAll(array $filters): array
    {
        $sortBy = $this->resolveSortBy($filters['sort_column'] ?? null);
        $sortOrder = $this->resolveSortOrder($filters['sort_order'] ?? null);
        $page = max((int) ($filters['page'] ?? 1), 1);
        $limit = max((int) ($filters['limit'] ?? 10), 1);
        $search = trim((string) ($filters['search'] ?? ''));

        $query = $this->newQuery()->orderBy($sortBy, $sortOrder);

        if ($search !== '') {
            $this->applySearch($query, $search);
        }

        $this->applyFilters($query, $filters);

        $paginator = $query->paginate(
            $limit,
            ['*'],
            'page',
            $page
        );

        $result = $this->formatPaginator($paginator);
        $this->afterPaginate($result);

        return $result;
    }

    abstract protected function newQuery(): Builder;

    /**
     * @return list<string>
     */
    abstract protected function allowedSortColumns(): array;

    protected function defaultSortBy(): string
    {
        return 'id';
    }

    protected function defaultSortOrder(): string
    {
        return 'asc';
    }

    protected function applySearch(Builder $query, string $search): void
    {
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
    }

    protected function afterPaginate(array &$result): void
    {
    }

    private function resolveSortBy(?string $sortBy): string
    {
        return in_array($sortBy, $this->allowedSortColumns(), true)
            ? $sortBy
            : $this->defaultSortBy();
    }

    private function resolveSortOrder(?string $sortOrder): string
    {
        $normalizedSortOrder = strtolower((string) $sortOrder);
        $allowed = ['asc', 'desc'];

        return in_array($normalizedSortOrder, $allowed, true)
            ? $normalizedSortOrder
            : $this->defaultSortOrder();
    }
}
