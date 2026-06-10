<?php

namespace App\Services\TutorialPeriods\Scheduling;

use App\Models\TutorialClass;

interface TutorialClassScheduleConstraint
{
    public function validate(
        TutorialClass $tutorialClass,
        int $roomId,
        int $dayOfWeek,
        int $startPeriod,
        int $endPeriod
    ): void;
}
