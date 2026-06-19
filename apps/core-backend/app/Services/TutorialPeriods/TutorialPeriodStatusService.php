<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\States\TutorialPeriods\TutorialPeriodStateFactory;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Illuminate\Support\Facades\DB;
use Carbon\CarbonInterface;

class TutorialPeriodStatusService
{
    public function __construct(
        private TutorialPeriodStateFactory $stateFactory
    ) {}

    public function revertToDraft(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return $this->transition(
            $tutorialPeriod,
            TutorialPeriodStatus::OPEN,
            TutorialPeriodStatus::DRAFT,
            'reverted to DRAFT'
        );
    }

    public function reopenRegistration(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return $this->transition(
            $tutorialPeriod,
            TutorialPeriodStatus::ASSIGNING,
            TutorialPeriodStatus::OPEN,
            'reopened for registration'
        );
    }

    public function restore(TutorialPeriod $tutorialPeriod, TutorialPeriodStatus $targetStatus): TutorialPeriod
    {
        $allowedTargets = [TutorialPeriodStatus::DRAFT, TutorialPeriodStatus::OPEN];

        if (!in_array($targetStatus, $allowedTargets, true)) {
            throw new ConflictHttpException('Cancelled tutorial periods can only be restored to DRAFT or OPEN');
        }

        return DB::transaction(function () use ($tutorialPeriod, $targetStatus): TutorialPeriod {
            $tutorialPeriod = $this->findTutorialPeriodOrFail($tutorialPeriod->id, ['createdBy'], true);

            if ($tutorialPeriod->status !== TutorialPeriodStatus::CANCELLED) {
                throw new ConflictHttpException('Only cancelled tutorial periods can be restored');
            }

            if ($tutorialPeriod->has_entered_ongoing) {
                throw new ConflictHttpException('Cannot restore a tutorial period that has entered ONGOING status');
            }

            if ($targetStatus === TutorialPeriodStatus::OPEN) {
                $this->validateOpenableDates($tutorialPeriod);
            }

            $tutorialPeriod->update([
                'status' => $targetStatus->value,
            ]);

            return $tutorialPeriod->refresh()->load('createdBy');
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function validateUpdate(TutorialPeriod $tutorialPeriod, array $data): void
    {
        $state = $this->stateFactory->forTutorialPeriod($tutorialPeriod);

        if (!$state->canEdit()) {
            throw new ConflictHttpException('This tutorial period is read-only');
        }
    }

    public function ensureDeletable(TutorialPeriod $tutorialPeriod): void
    {
        $state = $this->stateFactory->forTutorialPeriod($tutorialPeriod);

        if (!$state->canDelete()) {
            throw new ConflictHttpException('This tutorial period cannot be deleted.');
        }

        if ($this->hasRelatedData($tutorialPeriod)) {
            throw new ConflictHttpException(
                'Tutorial period cannot be deleted because related registrations, classes, or schedules already exist.'
            );
        }
    }

    /**
     * @return array{
     *   canEdit: bool,
     *   canDelete: bool,
     *   readOnly: bool,
     *   editableFields: list<string>,
     *   allowedStatuses: list<string>
     * }
     */
    public function getPermissions(TutorialPeriod $tutorialPeriod): array
    {
        $state = $this->stateFactory->forTutorialPeriod($tutorialPeriod);
        $hasRelatedData = $this->hasRelatedData($tutorialPeriod);

        return [
            'canEdit' => $state->canEdit(),
            'canDelete' => $state->canDelete() && !$hasRelatedData,
            'readOnly' => !$state->canEdit(),
            'editableFields' => array_map(
                [$this, 'toPublicFieldName'],
                $state->editableFields()
            ),
            'allowedStatuses' => array_map(
                static fn (TutorialPeriodStatus $status): string => $status->name,
                $state->allowedStatuses()
            ),
        ];
    }

    private function registrationsCount(TutorialPeriod $tutorialPeriod): int
    {
        if (isset($tutorialPeriod->registrations_count)) {
            return (int) $tutorialPeriod->registrations_count;
        }

        return $tutorialPeriod->registrations()->count();
    }

    private function classesCount(TutorialPeriod $tutorialPeriod): int
    {
        if (isset($tutorialPeriod->classes_count)) {
            return (int) $tutorialPeriod->classes_count;
        }

        return $tutorialPeriod->classes()->count();
    }

    private function hasRelatedData(TutorialPeriod $tutorialPeriod): bool
    {
        return $this->registrationsCount($tutorialPeriod) > 0 || $this->classesCount($tutorialPeriod) > 0;
    }

    private function toPublicFieldName(string $field): string
    {
        return match ($field) {
            'academic_period_id' => 'academicPeriodId',
            'registration_start_at' => 'registrationStartAt',
            'registration_end_at' => 'registrationEndAt',
            'study_start_at' => 'studyStartAt',
            'study_end_at' => 'studyEndAt',
            default => \Illuminate\Support\Str::camel($field),
        };
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

    public function cancel(TutorialPeriod $tutorialPeriod): TutorialPeriod
    {
        return DB::transaction(function () use ($tutorialPeriod): TutorialPeriod {
            $tutorialPeriod = $this->findTutorialPeriodOrFail($tutorialPeriod->id, ['createdBy'], true);

            $allowedFrom = [
                TutorialPeriodStatus::DRAFT,
                TutorialPeriodStatus::OPEN,
                TutorialPeriodStatus::ASSIGNING,
                TutorialPeriodStatus::ONGOING,
            ];

            if (!in_array($tutorialPeriod->status, $allowedFrom, true)) {
                throw new ConflictHttpException('Only active tutorial periods can be cancelled');
            }

            $tutorialPeriod->update([
                'status' => TutorialPeriodStatus::CANCELLED->value,
            ]);

            return $tutorialPeriod->refresh()->load('createdBy');
        });
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

            $updateData = ['status' => $to->value];
            if ($to === TutorialPeriodStatus::ONGOING) {
                $updateData['has_entered_ongoing'] = true;
            }

            $tutorialPeriod->update($updateData);

            return $tutorialPeriod->refresh()->load('createdBy');
        });
    }

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
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }

    public function validateOpenableDates(TutorialPeriod $tutorialPeriod): void
    {
        $minimumAssignmentDays = (int) config('tutorial.minimum_assignment_days', 2);

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
            ->update([
                'status' => TutorialPeriodStatus::ONGOING->value,
                'has_entered_ongoing' => true,
            ]);

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
}
