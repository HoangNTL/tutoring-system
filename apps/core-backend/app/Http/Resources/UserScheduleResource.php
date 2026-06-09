<?php

namespace App\Http\Resources;

use App\Models\TutorialClassSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TutorialClassSchedule
 */
class UserScheduleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $tutorialClass = $this->tutorialClass;
        $tutorialPeriod = $tutorialClass?->tutorialPeriod;

        return [
            'id' => $this->id,
            'classId' => $tutorialClass?->id,
            'tutorialPeriodId' => $tutorialPeriod?->id,
            'tutorialPeriodTitle' => $tutorialPeriod?->title,
            'courseCode' => $tutorialClass?->course_code,
            'courseName' => $tutorialClass?->course_name,
            'lecturerId' => $tutorialClass?->lecturer_id,
            'lecturerName' => (string) ($tutorialClass?->lecturer_name ?? ''),
            'roomCode' => (string) ($this->room_code ?? ''),
            'roomName' => (string) ($this->room_name ?? ''),
            'dayOfWeek' => (int) $this->day_of_week,
            'startPeriod' => (int) $this->start_period,
            'endPeriod' => (int) $this->end_period,
            'studyStartAt' => $tutorialPeriod?->study_start_at?->format('Y-m-d H:i:s'),
            'studyEndAt' => $tutorialPeriod?->study_end_at?->format('Y-m-d H:i:s'),
        ];
    }
}
