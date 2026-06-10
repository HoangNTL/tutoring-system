<?php

namespace App\Services\TutorialPeriods\Scheduling;

use App\Models\TutorialClass;

class TutorialClassScheduleConstraintValidator
{
    /**
     * @var array<int, TutorialClassScheduleConstraint>
     */
    private array $constraints;

    public function __construct(
        LecturerAvailabilityConstraint $lecturerAvailabilityConstraint,
        RoomAvailabilityConstraint $roomAvailabilityConstraint
    ) {
        $this->constraints = [
            $lecturerAvailabilityConstraint,
            $roomAvailabilityConstraint,
        ];
    }

    public function validate(
        TutorialClass $tutorialClass,
        int $roomId,
        int $dayOfWeek,
        int $startPeriod,
        int $endPeriod
    ): void {
        foreach ($this->constraints as $constraint) {
            $constraint->validate(
                $tutorialClass,
                $roomId,
                $dayOfWeek,
                $startPeriod,
                $endPeriod
            );
        }
    }
}
