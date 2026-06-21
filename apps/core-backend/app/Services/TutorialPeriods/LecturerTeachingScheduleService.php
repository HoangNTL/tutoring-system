<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Models\TutorialClass;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;

class LecturerTeachingScheduleService
{
    /**
     * Get teaching schedule for a lecturer across active tutorial periods.
     *
     * @return array{periods: array, schedules: array}
     */
    public function getTeachingSchedule(User $user, ?int $tutorialPeriodId = null): array
    {
        $lecturerId = $user->lecturer_id;

        if ($lecturerId === null) {
            return [
                'periods' => [],
                'schedules' => [],
            ];
        }

        $activeStatuses = [
            TutorialPeriodStatus::ASSIGNING->value,
            TutorialPeriodStatus::ONGOING->value,
            TutorialPeriodStatus::CLOSED->value,
        ];

        // Get tutorial periods that have classes assigned to this lecturer
        $periodsWithClasses = TutorialClass::query()
            ->where('lecturer_id', $lecturerId)
            ->where('status', '!=', TutorialClassStatus::CANCELLED->value)
            ->pluck('tutorial_period_id')
            ->unique();

        $periodsQuery = TutorialPeriod::query()
            ->whereIn('id', $periodsWithClasses)
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

        // Get classes assigned to this lecturer for the target period
        $classes = TutorialClass::query()
            ->with('schedules')
            ->where('tutorial_period_id', $targetPeriodId)
            ->where('lecturer_id', $lecturerId)
            ->where('status', '!=', TutorialClassStatus::CANCELLED->value)
            ->orderBy('course_name')
            ->get();

        // Get student counts per course_code
        $studentCounts = TutorialRegistration::query()
            ->selectRaw('course_code, COUNT(*) as student_count')
            ->where('tutorial_period_id', $targetPeriodId)
            ->where('status', TutorialRegistrationStatus::REGISTERED)
            ->groupBy('course_code')
            ->pluck('student_count', 'course_code');

        $schedules = $classes->map(function (TutorialClass $class) use ($studentCounts) {
            $firstSchedule = $class->schedules->first();
            return [
                'classId' => $class->id,
                'courseCode' => $class->course_code,
                'courseName' => $class->course_name,
                'credits' => $class->credits,
                'dayOfWeek' => $firstSchedule?->day_of_week,
                'startPeriod' => $firstSchedule?->start_period,
                'room' => $firstSchedule?->room,
                'totalSessions' => $class->total_sessions,
                'periodsPerSession' => $class->periods_per_session,
                'totalPeriods' => $class->total_periods,
                'studentCount' => (int) ($studentCounts[$class->course_code] ?? 0),
                'classStatus' => $class->status?->name,
                'schedules' => $class->schedules->map(fn($s) => [
                    'dayOfWeek' => $s->day_of_week,
                    'startPeriod' => $s->start_period,
                    'room' => $s->room,
                ])->all(),
            ];
        })
        ->sortBy([
            ['dayOfWeek', 'asc'],
            ['startPeriod', 'asc'],
            ['courseName', 'asc'],
        ])
        ->values()
        ->all();

        return [
            'periods' => $periods,
            'schedules' => $schedules,
        ];
    }
}
