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
    private const DEFAULT_MINIMUM_ASSIGNMENT_DAYS = 1;

    public function ensureDraftStatus(TutorialPeriod $tutorialPeriod, string $action): void
    {
        if ($tutorialPeriod->status !== TutorialPeriodStatus::DRAFT) {
            throw new ConflictHttpException("Only tutorial periods in DRAFT status can be {$action}");
        }
    }

    public function open(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return $this->transition(
            $tutorialPeriod,
            TutorialPeriodStatus::DRAFT,
            TutorialPeriodStatus::OPEN,
            'opened',
            true
        );
    }

    public function assigning(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return $this->transition(
            $tutorialPeriod,
            TutorialPeriodStatus::OPEN,
            TutorialPeriodStatus::ASSIGNING,
            'moved to ASSIGNING'
        );
    }

    public function ongoing(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return $this->transition(
            $tutorialPeriod,
            TutorialPeriodStatus::ASSIGNING,
            TutorialPeriodStatus::ONGOING,
            'moved to ONGOING'
        );
    }

    public function close(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return $this->transition(
            $tutorialPeriod,
            TutorialPeriodStatus::ONGOING,
            TutorialPeriodStatus::CLOSED,
            'closed'
        );
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
        $minimumAssignmentDays = (int) config('tutorial.minimum_assignment_days', self::DEFAULT_MINIMUM_ASSIGNMENT_DAYS);

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
            $tutorialPeriod->registration_start_at->gt($tutorialPeriod->registration_end_at) ||
            $tutorialPeriod->registration_end_at->copy()->addDays($minimumAssignmentDays + 1)->gt($tutorialPeriod->study_start_at) ||
            $tutorialPeriod->study_start_at->gt($tutorialPeriod->study_end_at)
        ) {
            throw new ConflictHttpException('Tutorial period dates are invalid for opening');
        }
    }

    /**
     * Check if tutorial period can be edited (must be in DRAFT status)
     */
    public function canEdit(TutorialPeriod $tutorialPeriod): bool
    {
        return $tutorialPeriod->status === TutorialPeriodStatus::DRAFT;
    }

    /**
     * Check if tutorial period can be deleted (must be in DRAFT status)
     */
    public function canDelete(TutorialPeriod $tutorialPeriod): bool
    {
        return $tutorialPeriod->status === TutorialPeriodStatus::DRAFT;
    }

    /**
     * Check if tutorial period can be opened (must be in DRAFT status)
     */
    public function canOpen(TutorialPeriod $tutorialPeriod): bool
    {
        return $tutorialPeriod->status === TutorialPeriodStatus::DRAFT;
    }

    /**
     * Check if tutorial period can transition to ASSIGNING (must be in OPEN status)
     */
    public function canAssigning(TutorialPeriod $tutorialPeriod): bool
    {
        return $tutorialPeriod->status === TutorialPeriodStatus::OPEN;
    }

    /**
     * Check if tutorial period can transition to ONGOING (must be in ASSIGNING status)
     */
    public function canOngoing(TutorialPeriod $tutorialPeriod): bool
    {
        return $tutorialPeriod->status === TutorialPeriodStatus::ASSIGNING;
    }

    /**
     * Check if tutorial period can transition to CLOSED (must be in ONGOING status)
     */
    public function canClose(TutorialPeriod $tutorialPeriod): bool
    {
        return $tutorialPeriod->status === TutorialPeriodStatus::ONGOING;
    }

    /**
     * Check if tutorial period can be cancelled (cannot be CLOSED or CANCELLED)
     */
    public function canCancel(TutorialPeriod $tutorialPeriod): bool
    {
        return !in_array(
            $tutorialPeriod->status,
            [TutorialPeriodStatus::CLOSED, TutorialPeriodStatus::CANCELLED],
            true
        );
    }

    /**
     * @return array<string, bool>
     */
    public function getPermissions(TutorialPeriodStatus $status): array
    {
        // This method now delegates to status-specific checks for consistency
        $mockPeriod = new TutorialPeriod(['status' => $status]);

        return [
            'canEdit' => $this->canEdit($mockPeriod),
            'canDelete' => $this->canDelete($mockPeriod),
            'canOpen' => $this->canOpen($mockPeriod),
            'canAssigning' => $this->canAssigning($mockPeriod),
            'canOngoing' => $this->canOngoing($mockPeriod),
            'canClose' => $this->canClose($mockPeriod),
            'canCancel' => $this->canCancel($mockPeriod),
        ];
    }

    private function transition(
        TutorialPeriod $tutorialPeriod,
        TutorialPeriodStatus $from,
        TutorialPeriodStatus $to,
        string $action,
        bool $validateDates = false
    ): TutorialPeriod {
        return DB::transaction(function () use ($tutorialPeriod, $from, $to, $action, $validateDates): TutorialPeriod {
            $tutorialPeriod = $this->findTutorialPeriodOrFail($tutorialPeriod->id, ['createdBy'], true);

            if ($tutorialPeriod->status !== $from) {
                throw new ConflictHttpException(sprintf(
                    'Only tutorial periods in %s status can be %s',
                    $from->name,
                    $action
                ));
            }

            if ($validateDates) {
                $this->validateOpenableDates($tutorialPeriod);
            }

            $tutorialPeriod->update([
                'status' => $to->value,
            ]);

            return $tutorialPeriod->refresh()->load('createdBy');
        });
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
