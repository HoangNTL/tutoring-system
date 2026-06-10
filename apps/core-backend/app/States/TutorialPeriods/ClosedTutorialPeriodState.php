<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;

class ClosedTutorialPeriodState extends AbstractTutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::CLOSED;
    }
}
