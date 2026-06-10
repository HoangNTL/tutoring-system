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

    public function canDelete(): bool
    {
        return true;
    }

    public function canOpen(): bool
    {
        return true;
    }

    public function canCancel(): bool
    {
        return true;
    }

    public function allowsTransitionTo(TutorialPeriodStatus $status): bool
    {
        return in_array($status, [
            TutorialPeriodStatus::OPEN,
            TutorialPeriodStatus::CANCELLED,
        ], true);
    }
}
