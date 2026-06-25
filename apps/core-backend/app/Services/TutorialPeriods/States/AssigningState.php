<?php

namespace App\Services\TutorialPeriods\States;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;

class AssigningState extends TutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::ASSIGNING;
    }

    public function ongoing(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update([
            'status' => TutorialPeriodStatus::ONGOING->value,
            'has_entered_ongoing' => true,
        ]);
    }

    public function reopenRegistration(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update([
            'status' => TutorialPeriodStatus::OPEN->value,
        ]);
    }

    public function getPermissions(TutorialPeriod $tutorialPeriod): array
    {
        return array_merge(parent::getPermissions($tutorialPeriod), [
            'canOngoing' => true,
            'canReopenRegistration' => true,
        ]);
    }
}
