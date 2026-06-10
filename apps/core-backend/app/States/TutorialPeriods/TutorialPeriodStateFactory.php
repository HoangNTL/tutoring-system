<?php

namespace App\States\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;

class TutorialPeriodStateFactory
{
    public function forTutorialPeriod(TutorialPeriod $tutorialPeriod): TutorialPeriodState
    {
        return $this->forStatus($tutorialPeriod->status);
    }

    public function forStatus(TutorialPeriodStatus $status): TutorialPeriodState
    {
        return match ($status) {
            TutorialPeriodStatus::DRAFT => new DraftTutorialPeriodState(),
            TutorialPeriodStatus::OPEN => new OpenTutorialPeriodState(),
            TutorialPeriodStatus::ASSIGNING => new AssigningTutorialPeriodState(),
            TutorialPeriodStatus::ONGOING => new OngoingTutorialPeriodState(),
            TutorialPeriodStatus::CLOSED => new ClosedTutorialPeriodState(),
            TutorialPeriodStatus::CANCELLED => new CancelledTutorialPeriodState(),
        };
    }
}
