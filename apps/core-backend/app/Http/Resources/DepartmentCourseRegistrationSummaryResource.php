<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentCourseRegistrationSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'courseCode' => $this->courseCode,
            'courseName' => $this->courseName,
            'credits' => (int) $this->credits,
            'studentCount' => (int) $this->studentCount,
        ];
    }
}
