<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentTutorialRegistrationInfoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $tutorialPeriod = $this['tutorialPeriod'];

        return [
            'tutorialPeriod' => [
                'id' => $tutorialPeriod->id,
                'title' => $tutorialPeriod->title,
                'academicPeriod' => $tutorialPeriod->getAcademicPeriodAttribute(),
                'registrationEndAt' => $tutorialPeriod->registration_end_at?->format('Y-m-d H:i:s'),
                'status' => $tutorialPeriod->status?->name,
            ],
            'permissions' => [
                'canViewRegistrationInfo' => (bool) ($this['permissions']['canViewRegistrationInfo'] ?? false),
                'canRegister' => (bool) ($this['permissions']['canRegister'] ?? false),
                'canCancelRegistration' => (bool) ($this['permissions']['canCancelRegistration'] ?? false),
                'canViewSchedule' => (bool) ($this['permissions']['canViewSchedule'] ?? false),
            ],
            'availableCourses' => collect($this['availableCourses'] ?? [])->map(
                static fn (array $course): array => [
                    'courseCode' => (string) ($course['courseCode'] ?? ''),
                    'courseName' => (string) ($course['courseName'] ?? ''),
                    'credits' => (int) ($course['credits'] ?? 0),
                ]
            )->values()->all(),
            'registeredCourses' => collect($this['registeredCourses'] ?? [])->map(
                static fn (array $course): array => [
                    'courseCode' => (string) ($course['courseCode'] ?? ''),
                    'courseName' => (string) ($course['courseName'] ?? ''),
                    'credits' => (int) ($course['credits'] ?? 0),
                    'registeredAt' => $course['registeredAt'] ?? null,
                ]
            )->values()->all(),
        ];
    }
}
