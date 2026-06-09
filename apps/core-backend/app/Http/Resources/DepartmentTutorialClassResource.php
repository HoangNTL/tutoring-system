<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentTutorialClassResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $schedulePreview = $this->resource->relationLoaded('schedules')
            ? $this->schedules->first()
            : null;

        return [
            'id' => $this->id,
            'tutorialPeriodId' => $this->tutorial_period_id,
            'courseCode' => $this->course_code,
            'courseName' => $this->course_name,
            'credits' => $this->credits,
            'studentCount' => (int) data_get($this->resource, 'student_count', 0),
            'totalSessions' => $this->total_sessions,
            'periodsPerSession' => $this->periods_per_session,
            'totalPeriods' => $this->total_periods,
            'lecturerId' => $this->lecturer_id,
            'lecturerCode' => $this->lecturer_code,
            'lecturerName' => $this->lecturer_name,
            'scheduleCount' => (int) data_get($this->resource, 'schedules_count', 0),
            'schedulePreview' => $schedulePreview ? [
                'id' => $schedulePreview->id,
                'tutorialClassId' => $schedulePreview->tutorial_class_id,
                'roomId' => $schedulePreview->room_id,
                'roomCode' => $schedulePreview->room_code,
                'roomName' => $schedulePreview->room_name,
                'roomCapacity' => $schedulePreview->room_capacity,
                'dayOfWeek' => $schedulePreview->day_of_week,
                'startPeriod' => $schedulePreview->start_period,
                'endPeriod' => $schedulePreview->end_period,
            ] : null,
            'status' => $this->status?->name,
            'assignedAt' => $this->assigned_at?->format('Y-m-d H:i:s'),
            'cancelledAt' => $this->cancelled_at?->format('Y-m-d H:i:s'),
        ];
    }
}
