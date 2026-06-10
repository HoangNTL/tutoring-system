<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

class AssigningTutorialPeriodState extends AbstractTutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::ASSIGNING;
    }

    public function canOngoing(): bool
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
            TutorialPeriodStatus::ONGOING,
            TutorialPeriodStatus::CANCELLED,
        ], true);
    }
}
