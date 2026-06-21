<?php

namespace App\Services\TutorialPeriods;

use App\Contracts\LegacyDataGateway;
use App\Enums\TutorialClassStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Models\TutorialClass;
use App\Models\TutorialRegistration;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class StudentScheduleForDepartmentService
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    /**
     * Get busy schedule slots for students registered in a tutorial class's course.
     *
     * Finds all other scheduled tutorial classes in the same period that the
     * same students are also registered for, and returns conflict information
     * per time slot (dayOfWeek + startPeriod).
     *
     * @return array{totalStudents: int, busySlots: array}
     */
    public function getStudentBusySlots(int $classId, ?int $departmentId = null): array
    {
        $tutorialClass = TutorialClass::query()
            ->with('tutorialPeriod')
            ->find($classId);

        if (!$tutorialClass) {
            throw new NotFoundHttpException('Tutorial class not found');
        }

        if ($departmentId !== null && $tutorialClass->department_id !== $departmentId) {
            throw new NotFoundHttpException('Tutorial class not found for this department');
        }

        $tutorialPeriodId = (int) $tutorialClass->tutorial_period_id;
        $courseCode = (string) $tutorialClass->course_code;

        // 1. Get all student user_ids registered for this course in this period
        $studentUserIds = TutorialRegistration::query()
            ->where('tutorial_period_id', $tutorialPeriodId)
            ->where('course_code', $courseCode)
            ->where('status', TutorialRegistrationStatus::REGISTERED->value)
            ->pluck('user_id')
            ->unique()
            ->values()
            ->all();

        $totalStudents = count($studentUserIds);

        if ($totalStudents === 0) {
            return [
                'totalStudents' => 0,
                'busySlots' => [],
            ];
        }

        // 2. Get all OTHER tutorial classes in this period that have schedules
        //    and that these students are also registered for
        $otherClassCourses = TutorialRegistration::query()
            ->where('tutorial_period_id', $tutorialPeriodId)
            ->whereIn('user_id', $studentUserIds)
            ->where('status', TutorialRegistrationStatus::REGISTERED->value)
            ->where('course_code', '!=', $courseCode)
            ->select('user_id', 'course_code')
            ->get();

        if ($otherClassCourses->isEmpty()) {
            return [
                'totalStudents' => $totalStudents,
                'busySlots' => [],
            ];
        }

        // 3. Get schedules for those other classes
        $otherCourseCodes = $otherClassCourses->pluck('course_code')->unique()->values()->all();

        $scheduledClasses = TutorialClass::query()
            ->with('schedules')
            ->where('tutorial_period_id', $tutorialPeriodId)
            ->where('id', '!=', $classId)
            ->whereIn('course_code', $otherCourseCodes)
            ->where('status', TutorialClassStatus::PLANNED->value)
            ->get()
            ->keyBy('course_code');

        // 4. Build a map: courseCode -> [user_ids registered for that course]
        $courseToStudents = [];
        foreach ($otherClassCourses as $registration) {
            $courseToStudents[$registration->course_code][] = $registration->user_id;
        }

        // 5. Build busy slots: for each scheduled class, identify the slot and
        //    which students from our class are also in that slot
        $busySlotsMap = []; // key: "dayOfWeek-startPeriod" => [user_ids]

        foreach ($scheduledClasses as $otherClass) {
            $registeredStudentIds = $courseToStudents[$otherClass->course_code] ?? [];

            if (empty($registeredStudentIds) || $otherClass->schedules->isEmpty()) {
                continue;
            }

            foreach ($otherClass->schedules as $schedule) {
                $key = $schedule->day_of_week . '-' . $schedule->start_period;

                if (!isset($busySlotsMap[$key])) {
                    $busySlotsMap[$key] = [
                        'dayOfWeek' => $schedule->day_of_week,
                        'startPeriod' => $schedule->start_period,
                        'userIds' => [],
                    ];
                }

                foreach ($registeredStudentIds as $userId) {
                    $busySlotsMap[$key]['userIds'][$userId] = true;
                }
            }
        }

        // 6. Resolve student names from legacy
        $allConflictUserIds = [];
        foreach ($busySlotsMap as $slot) {
            foreach (array_keys($slot['userIds']) as $userId) {
                $allConflictUserIds[$userId] = true;
            }
        }

        $studentNames = $this->resolveStudentNames(array_keys($allConflictUserIds));

        // 7. Format response
        $busySlots = [];
        foreach ($busySlotsMap as $slot) {
            $conflictUserIds = array_keys($slot['userIds']);
            $students = array_map(
                fn(int $userId) => $studentNames[$userId] ?? "SV #$userId",
                $conflictUserIds
            );

            $busySlots[] = [
                'dayOfWeek' => $slot['dayOfWeek'],
                'startPeriod' => $slot['startPeriod'],
                'conflictCount' => count($conflictUserIds),
                'students' => array_values($students),
            ];
        }

        // Sort by dayOfWeek, then startPeriod
        usort($busySlots, function ($a, $b) {
            if ($a['dayOfWeek'] !== $b['dayOfWeek']) {
                return $a['dayOfWeek'] - $b['dayOfWeek'];
            }

            return $a['startPeriod'] - $b['startPeriod'];
        });

        return [
            'totalStudents' => $totalStudents,
            'busySlots' => $busySlots,
        ];
    }

    /**
     * @param  array<int> $userIds
     * @return array<int, string> userId => displayName
     */
    private function resolveStudentNames(array $userIds): array
    {
        if (empty($userIds)) {
            return [];
        }

        $users = DB::table('users')
            ->whereIn('id', $userIds)
            ->select('id', 'username', 'student_id')
            ->get();

        $names = [];

        foreach ($users as $user) {
            $displayName = $user->username;

            // Try fetching full name from legacy
            if ($user->student_id !== null) {
                $legacyInfo = $this->fetchLegacyStudentInfoSafe((int) $user->student_id);
                if ($legacyInfo && !empty($legacyInfo['fullName'])) {
                    $displayName = trim((string) $legacyInfo['fullName']);
                }
            }

            if ($displayName === $user->username) {
                $legacyInfo = $this->fetchLegacyStudentInfoByCodeSafe($user->username);
                if ($legacyInfo && !empty($legacyInfo['fullName'])) {
                    $displayName = trim((string) $legacyInfo['fullName']);
                }
            }

            $names[$user->id] = $displayName;
        }

        return $names;
    }

    private function fetchLegacyStudentInfoSafe(int $studentId): ?array
    {
        try {
            return $this->legacyDataGateway->fetchStudentInfoByLegacyStudentId($studentId);
        } catch (Throwable) {
            return null;
        }
    }

    private function fetchLegacyStudentInfoByCodeSafe(string $studentCode): ?array
    {
        try {
            return $this->legacyDataGateway->fetchStudentInfoByStudentCode($studentCode);
        } catch (Throwable) {
            return null;
        }
    }
}
