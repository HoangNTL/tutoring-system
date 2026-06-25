<?php

namespace App\Services\TutorialPeriods\States;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;

class OngoingState extends TutorialPeriodState
{
    public function status(): TutorialPeriodStatus
    {
        return TutorialPeriodStatus::ONGOING;
    }

    public function close(TutorialPeriod $tutorialPeriod): void
    {
        $tutorialPeriod->update([
            'status' => TutorialPeriodStatus::CLOSED->value,
        ]);
    }

    public function getPermissions(TutorialPeriod $tutorialPeriod): array
    {
        return array_merge(parent::getPermissions($tutorialPeriod), [
            'canClose' => true,
        ]);
    }
}
