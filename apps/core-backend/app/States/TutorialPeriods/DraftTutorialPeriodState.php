<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

class DraftTutorialPeriodState extends AbstractTutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::DRAFT;
    }

    public function canEdit(): bool
    {
        return true;
    }

    public function editableFields(): array
    {
        return $this->crudEditableFields();
    }

    public function allowedStatuses(): array
    {
        return $this->allStatuses();
    }
}
