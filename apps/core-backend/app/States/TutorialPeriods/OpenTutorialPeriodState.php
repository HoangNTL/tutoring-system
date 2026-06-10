<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

class OpenTutorialPeriodState extends AbstractTutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::OPEN;
    }

    public function canAssigning(): bool
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
            TutorialPeriodStatus::ASSIGNING,
            TutorialPeriodStatus::CANCELLED,
        ], true);
    }
}
