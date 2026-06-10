<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\States\TutorialPeriods\TutorialPeriodStateFactory;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class TutorialPeriodStatusService
{
    public function __construct(
        private TutorialPeriodStateFactory $stateFactory
    ) {}

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
}
