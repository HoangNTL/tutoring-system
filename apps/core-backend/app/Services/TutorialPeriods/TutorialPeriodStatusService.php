<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class TutorialPeriodStatusService
{
    public function ensureDraftStatus(TutorialPeriod $tutorialPeriod, string $action): void
    {
        if ($tutorialPeriod->status !== TutorialPeriodStatus::DRAFT) {
            throw new ConflictHttpException("Only tutorial periods in DRAFT status can be {$action}");
        }
    }

    public function open(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return DB::transaction(function () use ($tutorialPeriod): TutorialPeriod {
            $tutorialPeriod = $this->findTutorialPeriodOrFail($tutorialPeriod->id, ['createdBy'], true);

            if ($tutorialPeriod->status !== TutorialPeriodStatus::DRAFT) {
                throw new ConflictHttpException('Only tutorial periods in DRAFT status can be opened');
            }

            $this->validateOpenableDates($tutorialPeriod);

            $tutorialPeriod->update([
                'status' => TutorialPeriodStatus::OPEN->value,
            ]);

            return $tutorialPeriod->refresh()->load('createdBy');
        });
    }

    public function cancel(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return DB::transaction(function () use ($tutorialPeriod): TutorialPeriod {
            $tutorialPeriod = $this->findTutorialPeriodOrFail($tutorialPeriod->id, ['createdBy'], true);

            if (in_array($tutorialPeriod->status, [TutorialPeriodStatus::CLOSED, TutorialPeriodStatus::CANCELLED], true)) {
                throw new ConflictHttpException('This tutorial period cannot be cancelled');
            }

            $tutorialPeriod->update([
                'status' => TutorialPeriodStatus::CANCELLED->value,
            ]);

            return $tutorialPeriod->refresh()->load('createdBy');
        });
    }

    /**
     * @return array{open_to_assigning:int,assigning_to_ongoing:int,ongoing_to_closed:int}
     */
    public function updateExpiredStatuses(): array
    {
        $now = now();

        $ongoingToClosed = TutorialPeriod::query()
            ->where('status', TutorialPeriodStatus::ONGOING->value)
            ->whereNotNull('study_end_at')
            ->where('study_end_at', '<', $now)
            ->update(['status' => TutorialPeriodStatus::CLOSED->value]);

        $assigningToOngoing = TutorialPeriod::query()
            ->where('status', TutorialPeriodStatus::ASSIGNING->value)
            ->whereNotNull('study_start_at')
            ->where('study_start_at', '<=', $now)
            ->update(['status' => TutorialPeriodStatus::ONGOING->value]);

        $openToAssigning = TutorialPeriod::query()
            ->where('status', TutorialPeriodStatus::OPEN->value)
            ->whereNotNull('registration_end_at')
            ->where('registration_end_at', '<', $now)
            ->update(['status' => TutorialPeriodStatus::ASSIGNING->value]);

        return [
            'open_to_assigning' => $openToAssigning,
            'assigning_to_ongoing' => $assigningToOngoing,
            'ongoing_to_closed' => $ongoingToClosed,
        ];
    }

    public function validateOpenableDates(TutorialPeriod $tutorialPeriod): void
    {
        foreach ([
            'registration_start_at',
            'registration_end_at',
            'study_start_at',
            'study_end_at',
        ] as $field) {
            if (!$tutorialPeriod->{$field} instanceof CarbonInterface) {
                throw new ConflictHttpException('Tutorial period must have complete dates before opening');
            }
        }

        if (
            $tutorialPeriod->registration_start_at->gte($tutorialPeriod->registration_end_at) ||
            $tutorialPeriod->registration_end_at->gte($tutorialPeriod->study_start_at) ||
            $tutorialPeriod->study_start_at->gte($tutorialPeriod->study_end_at)
        ) {
            throw new ConflictHttpException('Tutorial period dates are invalid for opening');
        }
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
