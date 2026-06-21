<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Models\TutorialClass;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;

class StudentStudyScheduleService
{
    /**
     * Get scheduled classes for a student across active tutorial periods.
     *
     * @return array{periods: array, schedules: array}
     */
    public function getStudySchedule(User $user, ?int $tutorialPeriodId = null): array
    {
        $activeStatuses = [
            TutorialPeriodStatus::OPEN->value,
            TutorialPeriodStatus::ASSIGNING->value,
            TutorialPeriodStatus::ONGOING->value,
            TutorialPeriodStatus::CLOSED->value,
        ];

        // Get available tutorial periods
        $periodsQuery = TutorialPeriod::query()
            ->whereIn('status', $activeStatuses)
            ->orderByDesc('created_at');

        $periods = $periodsQuery->get()->map(fn(TutorialPeriod $period) => [
            'id' => $period->id,
            'title' => $period->title,
            'status' => $period->status->name,
            'studyStartAt' => $period->study_start_at->toIso8601String(),
            'studyEndAt' => $period->study_end_at->toIso8601String(),
        ])->all();

        // Determine which period to query
        $targetPeriodId = $tutorialPeriodId;
        if ($targetPeriodId === null && !empty($periods)) {
            $targetPeriodId = $periods[0]['id'];
        }

        if ($targetPeriodId === null) {
            return [
                'periods' => $periods,
                'schedules' => [],
            ];
        }

        // Get student's registered courses for this period
        $registrations = TutorialRegistration::query()
            ->where('tutorial_period_id', $targetPeriodId)
            ->where('user_id', $user->id)
            ->where('status', TutorialRegistrationStatus::REGISTERED)
            ->orderBy('course_name')
            ->get();

        // Get tutorial classes for this period keyed by course_code
        $classes = TutorialClass::query()
            ->with('schedules')
            ->where('tutorial_period_id', $targetPeriodId)
            ->get()
            ->keyBy('course_code');

        $schedules = $registrations->map(function (TutorialRegistration $registration) use ($classes) {
            $class = $classes->get($registration->course_code);
            $firstSchedule = $class?->schedules?->first();

            return [
                'courseCode' => $registration->course_code,
                'courseName' => $registration->course_name,
                'credits' => $registration->credits,
                'dayOfWeek' => $firstSchedule?->day_of_week,
                'startPeriod' => $firstSchedule?->start_period,
                'room' => $firstSchedule?->room,
                'lecturerName' => $class?->lecturer_name,
                'totalSessions' => $class?->total_sessions,
                'periodsPerSession' => $class?->periods_per_session,
                'classStatus' => $class?->status?->name,
                'schedules' => $class?->schedules?->map(fn($s) => [
                    'dayOfWeek' => $s->day_of_week,
                    'startPeriod' => $s->start_period,
                    'room' => $s->room,
                ])->all() ?? [],
            ];
        })->values()->all();

        return [
            'periods' => $periods,
            'schedules' => $schedules,
        ];
    }
}
