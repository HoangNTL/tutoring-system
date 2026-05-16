<?php

namespace App\Services;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\Models\TutorialPeriodStatusLog;
use App\Traits\PaginationHelper;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TutorialPeriodService
{
    use PaginationHelper;

    /**
     * @var list<string>
     */
    private array $sortableColumns = [
        'id',
        'title',
        'start_reg_date',
        'end_reg_date',
        'start_study_date',
        'end_study_date',
        'status',
        'created_at',
        'updated_at',
    ];

    public function getAll(array $filters): array
    {
        $sortBy = $this->resolveSortBy($filters['sort_by'] ?? null);
        $sortOrder = $this->resolveSortOrder($filters['sort_order'] ?? null);
        $page = max((int) ($filters['page'] ?? 1), 1);
        $limit = max((int) ($filters['limit'] ?? 10), 1);
        $search = trim((string) ($filters['search'] ?? ''));
        $status = $this->resolveStatus($filters['status'] ?? null);

        $query = TutorialPeriod::query()
            ->with('createdBy')
            ->orderBy($sortBy, $sortOrder);

        if ($search !== '') {
            $query->where('title', 'like', '%' . $search . '%');
        }

        if ($status !== null) {
            $query->where('status', $status->value);
        }

        $paginator = $query->paginate(
            $limit,
            ['*'],
            'page',
            $page
        );

        return $this->formatPaginator($paginator);
    }

    public function getById(int $id): TutorialPeriod
    {
        return $this->findTutorialPeriodOrFail($id, ['createdBy', 'statusLogs.changedBy']);
    }

    public function create(array $data, int $userId): TutorialPeriod
    {
        $tutorialPeriod = TutorialPeriod::create([
            ...$this->extractTutorialPeriodAttributes($data),
            'status' => TutorialPeriodStatus::DRAFT->value,
            'created_by' => $userId,
        ]);

        return $tutorialPeriod->load('createdBy');
    }

    public function update(int $id, array $data): TutorialPeriod
    {
        $tutorialPeriod = $this->getById($id);

        $this->ensureDraftStatus($tutorialPeriod, 'updated');

        $tutorialPeriod->update($this->extractTutorialPeriodAttributes($data));

        return $tutorialPeriod->refresh()->load(['createdBy', 'statusLogs.changedBy']);
    }

    public function delete(int $id): void
    {
        $tutorialPeriod = $this->getById($id);

        $this->ensureDraftStatus($tutorialPeriod, 'deleted');

        $tutorialPeriod->delete();
    }

    public function open(int $id, int $changedBy): TutorialPeriod
    {
        return $this->transition(
            $id,
            TutorialPeriodStatus::DRAFT,
            TutorialPeriodStatus::OPEN,
            'opened_at',
            $changedBy,
            function (TutorialPeriod $tutorialPeriod): void {
                if (
                    $tutorialPeriod->start_reg_date === null ||
                    $tutorialPeriod->end_reg_date === null ||
                    $tutorialPeriod->start_reg_date->gte($tutorialPeriod->end_reg_date)
                ) {
                    throw new ConflictHttpException('Tutorial period must have valid registration dates before opening');
                }
            }
        );
    }

    public function assigning(int $id, int $changedBy): TutorialPeriod
    {
        return $this->transition(
            $id,
            TutorialPeriodStatus::OPEN,
            TutorialPeriodStatus::ASSIGNING,
            'assigned_at',
            $changedBy,
            function (TutorialPeriod $tutorialPeriod): void {
                if (
                    $tutorialPeriod->end_reg_date === null ||
                    now()->lte($tutorialPeriod->end_reg_date->copy()->endOfDay())
                ) {
                    throw new ConflictHttpException('Tutorial period can only move to ASSIGNING after registration has ended');
                }
            }
        );
    }

    public function ongoing(int $id, int $changedBy): TutorialPeriod
    {
        return $this->transition(
            $id,
            TutorialPeriodStatus::ASSIGNING,
            TutorialPeriodStatus::ONGOING,
            'started_at',
            $changedBy
        );
    }

    public function close(int $id, int $changedBy): TutorialPeriod
    {
        return $this->transition(
            $id,
            TutorialPeriodStatus::ONGOING,
            TutorialPeriodStatus::CLOSED,
            'closed_at',
            $changedBy
        );
    }

    public function updateStatus(int $id, string $status, int $changedBy): TutorialPeriod
    {
        return match ($status) {
            TutorialPeriodStatus::OPEN->name => $this->open($id, $changedBy),
            TutorialPeriodStatus::ASSIGNING->name => $this->assigning($id, $changedBy),
            TutorialPeriodStatus::ONGOING->name => $this->ongoing($id, $changedBy),
            TutorialPeriodStatus::CLOSED->name => $this->close($id, $changedBy),
            default => throw new ConflictHttpException('Unsupported tutorial period status transition'),
        };
    }

    private function ensureDraftStatus(TutorialPeriod $tutorialPeriod, string $action): void
    {
        if ($tutorialPeriod->status !== TutorialPeriodStatus::DRAFT) {
            throw new ConflictHttpException("Only tutorial periods in DRAFT status can be {$action}");
        }
    }

    private function transition(
        int $id,
        TutorialPeriodStatus $fromStatus,
        TutorialPeriodStatus $toStatus,
        string $timestampColumn,
        int $changedBy,
        ?callable $beforeTransition = null
    ): TutorialPeriod {
        return DB::transaction(function () use (
            $id,
            $fromStatus,
            $toStatus,
            $timestampColumn,
            $changedBy,
            $beforeTransition
        ) {
            $tutorialPeriod = $this->findTutorialPeriodOrFail($id, lockForUpdate: true);

            if ($tutorialPeriod->status !== $fromStatus) {
                throw new ConflictHttpException(
                    "Invalid transition from {$tutorialPeriod->status->name} to {$toStatus->name}"
                );
            }

            if ($beforeTransition !== null) {
                $beforeTransition($tutorialPeriod);
            }

            $oldStatus = $tutorialPeriod->status;
            $timestamp = now();

            $tutorialPeriod->forceFill([
                'status' => $toStatus->value,
                $timestampColumn => $timestamp,
            ])->save();

            TutorialPeriodStatusLog::query()->create([
                'tutorial_period_id' => $tutorialPeriod->id,
                'old_status' => $oldStatus->value,
                'new_status' => $toStatus->value,
                'changed_by' => $changedBy,
            ]);

            return $tutorialPeriod->refresh()->load(['createdBy', 'statusLogs.changedBy']);
        });
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

    private function resolveStatus(?string $status): ?TutorialPeriodStatus
    {
        if (!$status) {
            return null;
        }

        foreach (TutorialPeriodStatus::cases() as $tutorialPeriodStatus) {
            if ($tutorialPeriodStatus->name === $status) {
                return $tutorialPeriodStatus;
            }
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private function extractTutorialPeriodAttributes(array $data): array
    {
        return [
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'start_reg_date' => $data['start_reg_date'] ?? null,
            'end_reg_date' => $data['end_reg_date'] ?? null,
            'start_study_date' => $data['start_study_date'] ?? null,
            'end_study_date' => $data['end_study_date'] ?? null,
        ];
    }

    /**
     * @param  array<int, string>  $relations
     */
    private function findTutorialPeriodOrFail(
        int $id,
        array $relations = [],
        bool $lockForUpdate = false
    ): TutorialPeriod {
        $query = TutorialPeriod::query()->with($relations);

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        try {
            return $query->findOrFail($id);
        } catch (ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }
}
