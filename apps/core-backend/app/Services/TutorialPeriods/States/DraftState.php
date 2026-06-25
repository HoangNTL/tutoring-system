<?php

namespace App\Services\TutorialPeriods\States;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;

class DraftState extends TutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::DRAFT;
    }

    public function open(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update([
            'status' => TutorialPeriodStatus::OPEN->value,
        ]);
    }

    public function getPermissions(TutorialPeriod $tutorialPeriod): array
    {
        return array_merge(parent::getPermissions($tutorialPeriod), [
            'canEdit' => true,
            'canDelete' => true,
            'canOpen' => true,
            'canCancel' => true,
        ]);
    }

    public function getEditableFields(): array
    {
        return [
            'academic_period_id',
            'title',
            'description',
            'registration_start_at',
            'registration_end_at',
            'study_start_at',
            'study_end_at',
        ];
    }
}
