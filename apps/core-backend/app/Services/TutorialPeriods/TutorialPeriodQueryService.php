<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\Traits\PaginationHelper;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TutorialPeriodQueryService
{
    use PaginationHelper;

    /**
     * @var list<string>
     */
    private array $sortableColumns = [
        'id',
        'academic_period_id',
        'title',
        'registration_start_at',
        'registration_end_at',
        'study_start_at',
        'study_end_at',
        'status',
        'created_at',
        'updated_at',
    ];

    public function __construct(
        private TutorialPeriodAcademicPeriodResolver $academicPeriodResolver
    ) {}

    public function getAll(array $filters): array
    {
        $sortBy = $this->resolveSortBy($filters['sort_column'] ?? null);
        $sortOrder = $this->resolveSortOrder($filters['sort_order'] ?? null);
        $page = max((int) ($filters['page'] ?? 1), 1);
        $limit = max((int) ($filters['limit'] ?? 10), 1);
        $search = trim((string) ($filters['search'] ?? ''));
        $status = $this->resolveStatusFilter($filters['status'] ?? null);

        $query = TutorialPeriod::query()
            ->with('createdBy')
            ->orderBy($sortBy, $sortOrder);

        if ($search !== '') {
            $query->where('title', 'like', '%' . $search . '%');
        }

        if ($status !== null) {
            $this->applyStatusFilter($query, $status);
        }

        $paginator = $query->paginate(
            $limit,
            ['*'],
            'page',
            $page
        );

        $result = $this->formatPaginator($paginator);
        $this->academicPeriodResolver->enrichCollection($result['items']);

        return $result;
    }

    public function getById(int $id): TutorialPeriod
    {
        $tutorialPeriod = $this->findOrFail($id, ['createdBy']);
        $this->academicPeriodResolver->enrich($tutorialPeriod);

        return $tutorialPeriod;
    }

    /**
     * @param  array<int, string>  $relations
     */
    public function findOrFail(int $id, array $relations = []): TutorialPeriod
    {
        try {
            return TutorialPeriod::query()
                ->with($relations)
                ->findOrFail($id);
        } catch (ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }

    private function resolveSortBy(?string $sortBy): string
    {
        return in_array($sortBy, $this->sortableColumns, true)
            ? $sortBy
            : 'id';
    }

    private function resolveSortOrder(?string $sortOrder): string
    {
        $normalizedSortOrder = strtolower((string) $sortOrder);

        return in_array($normalizedSortOrder, ['asc', 'desc'], true)
            ? $normalizedSortOrder
            : 'asc';
    }

    private function resolveStatusFilter(?string $status): ?string
    {
        $status = strtoupper(trim((string) $status));

        if ($status === '') {
            return null;
        }

        return $status;
    }

    private function applyStatusFilter(Builder $query, string $status): void
    {
        match ($status) {
            TutorialPeriodStatus::DRAFT->name => $query->where('status', TutorialPeriodStatus::DRAFT->value),
            TutorialPeriodStatus::OPEN->name => $query->where('status', TutorialPeriodStatus::OPEN->value),
            TutorialPeriodStatus::ASSIGNING->name => $query->where('status', TutorialPeriodStatus::ASSIGNING->value),
            TutorialPeriodStatus::ONGOING->name => $query->where('status', TutorialPeriodStatus::ONGOING->value),
            TutorialPeriodStatus::CLOSED->name => $query->where('status', TutorialPeriodStatus::CLOSED->value),
            TutorialPeriodStatus::CANCELLED->name => $query->where('status', TutorialPeriodStatus::CANCELLED->value),
            default => null,
        };
    }
}
