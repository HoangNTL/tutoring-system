<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

class CancelledTutorialPeriodState extends AbstractTutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::CANCELLED;
    }

    public function canDelete(): bool
    {
        return false;
    }
}
