<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

class OngoingTutorialPeriodState extends AbstractTutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::ONGOING;
    }

    public function canClose(): bool
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
            TutorialPeriodStatus::CLOSED,
            TutorialPeriodStatus::CANCELLED,
        ], true);
    }
}
