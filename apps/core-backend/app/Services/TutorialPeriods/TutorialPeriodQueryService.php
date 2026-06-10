<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\Services\Support\AbstractPaginatedQueryService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TutorialPeriodQueryService extends AbstractPaginatedQueryService
{
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

    protected function newQuery(): Builder
    {
        return TutorialPeriod::query()->with('createdBy');
    }

    protected function allowedSortColumns(): array
    {
        return $this->sortableColumns;
    }

    protected function applySearch(Builder $query, string $search): void
    {
        $query->where('title', 'like', '%' . $search . '%');
    }

    protected function applyFilters(Builder $query, array $filters): void
    {
        $status = $this->resolveStatusFilter($filters['status'] ?? null);

        if ($status !== null) {
            $this->applyStatusFilter($query, $status);
        }
    }

    protected function afterPaginate(array &$result): void
    {
        $this->academicPeriodResolver->enrichCollection($result['items']);
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
