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
            'status' => $this->status?->name,
            'cancelledAt' => $this->cancelled_at?->format('Y-m-d H:i:s'),
        ];
    }
}
