<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

abstract class AbstractTutorialPeriodState implements TutorialPeriodState
{
    /**
     * @return list<string>
     */
    protected function crudEditableFields(): array
    {
        return [
            'academic_period_id',
            'title',
            'description',
            'registration_start_at',
            'registration_end_at',
            'study_start_at',
            'study_end_at',
            'status',
        ];
    }

    /**
     * @return list<TutorialPeriodStatus>
     */
    protected function allStatuses(): array
    {
        return TutorialPeriodStatus::cases();
    }

    public function canEdit(): bool
    {
        return false;
    }

    public function canDelete(): bool
    {
        return true;
    }

    public function editableFields(): array
    {
        return [];
    }

    public function allowedStatuses(): array
    {
        return [$this->status()];
    }
}
