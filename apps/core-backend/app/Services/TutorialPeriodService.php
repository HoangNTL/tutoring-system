<?php

namespace App\Services;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\Models\TutorialPeriodStatusLog;
use App\Traits\PaginationHelper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Date;
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
        $sortBy = in_array($filters['sortBy'], $this->sortableColumns, true)
            ? $filters['sortBy']
            : 'id';

        $query = TutorialPeriod::query()
            ->with('createdBy')
            ->orderBy($sortBy, $filters['sortOrder']);

        if (!empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        $paginator = $query->paginate(
            $filters['limit'],
            ['*'],
            'page',
            $filters['page']
        );

        return $this->formatPaginator($paginator);
    }

    public function getById(int $id): TutorialPeriod
    {
        return TutorialPeriod::query()
            ->with(['createdBy', 'statusLogs.changedBy'])
            ->find($id)
            ?? throw new NotFoundHttpException('Tutorial period not found');
    }

    public function create(array $data, int $userId): TutorialPeriod
    {
        $tutorialPeriod = TutorialPeriod::create([
            'title' => $data['title'],
            'description' => $data['description'],
            'start_reg_date' => $data['start_reg_date'],
            'end_reg_date' => $data['end_reg_date'],
            'start_study_date' => $data['start_study_date'],
            'end_study_date' => $data['end_study_date'],
            'status' => TutorialPeriodStatus::DRAFT->value,
            'created_by' => $userId,
        ]);

        return $tutorialPeriod->load('createdBy');
    }

    public function update(int $id, array $data): TutorialPeriod
    {
        $tutorialPeriod = $this->getById($id);

        $this->ensureDraftStatus($tutorialPeriod, 'updated');

        $tutorialPeriod->update([
            'title' => $data['title'],
            'description' => $data['description'],
            'start_reg_date' => $data['start_reg_date'],
            'end_reg_date' => $data['end_reg_date'],
            'start_study_date' => $data['start_study_date'],
            'end_study_date' => $data['end_study_date'],
        ]);

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
                    Date::today()->lte($tutorialPeriod->end_reg_date)
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
            $tutorialPeriod = TutorialPeriod::query()
                ->lockForUpdate()
                ->find($id);

            if (!$tutorialPeriod) {
                throw new NotFoundHttpException('Tutorial period not found');
            }

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
}
