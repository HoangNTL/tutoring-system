<?php

namespace App\Services\TutorialPeriods\Scheduling;

use App\Enums\TutorialClassStatus;
use App\Models\TutorialClass;
use App\Models\TutorialClassSchedule;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class RoomAvailabilityConstraint implements TutorialClassScheduleConstraint
{
    public function validate(
        TutorialClass $tutorialClass,
        int $roomId,
        int $dayOfWeek,
        int $startPeriod,
        int $endPeriod
    ): void {
        $hasConflict = TutorialClassSchedule::query()
            ->where('room_id', $roomId)
            ->where('day_of_week', $dayOfWeek)
            ->where('start_period', '<=', $endPeriod)
            ->where('end_period', '>=', $startPeriod)
            ->whereHas('tutorialClass', function (Builder $query) use ($tutorialClass): void {
                $query
                    ->where('tutorial_period_id', $tutorialClass->tutorial_period_id)
                    ->where('status', '!=', TutorialClassStatus::CANCELLED->value);
            })
            ->exists();

        if ($hasConflict) {
            throw new ConflictHttpException('Phòng học đã được sử dụng trong thời gian này.');
        }
    }
}
