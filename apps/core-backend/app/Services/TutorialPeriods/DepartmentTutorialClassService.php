<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Models\TutorialClass;
use App\Models\TutorialClassSchedule;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Services\External\LegacyApiService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DepartmentTutorialClassService
{
    public function __construct(
        private DepartmentTutorialRegistrationService $departmentTutorialRegistrationService,
        private LegacyApiService $legacyApiService
    ) {}

    /**
     * @return array<int, TutorialClass>
     */
    public function getClasses(int $tutorialPeriodId): array
    {
        $tutorialPeriod = $this->findAccessibleTutorialPeriodOrFail($tutorialPeriodId);

        $classes = TutorialClass::query()
            ->withCount('schedules')
            ->with([
                'schedules' => fn ($query) => $query
                    ->orderBy('day_of_week')
                    ->orderBy('start_period')
                    ->orderBy('room_code'),
            ])
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->orderByRaw(
                'CASE status
                    WHEN ? THEN 0
                    WHEN ? THEN 1
                    WHEN ? THEN 2
                    ELSE 3
                 END',
                [
                    TutorialClassStatus::SCHEDULED->value,
                    TutorialClassStatus::ASSIGNED->value,
                    TutorialClassStatus::PLANNED->value,
                ]
            )
            ->orderBy('course_name')
            ->get();

        return $this->attachStudentCounts($tutorialPeriod->id, $classes)->all();
    }

    /**
     * @return array<int, TutorialClassSchedule>
     */
    public function getSchedules(int $classId): array
    {
        $tutorialClass = $this->findClassInAccessiblePeriodOrFail($classId);

        return $tutorialClass->schedules()
            ->orderBy('day_of_week')
            ->orderBy('start_period')
            ->orderBy('room_code')
            ->get()
            ->all();
    }

    /**
     * @return array<int, array{id:int,code:string,name:string,capacity:int|null}>
     */
    public function getRoomOptions(): array
    {
        return $this->legacyApiService->fetchRooms();
    }

    /**
     * @return array<int, array{id:int,code:string,fullName:string,departmentName:string}>
     */
    public function getLecturerOptions(int $departmentId): array
    {
        return collect($this->legacyApiService->fetchLecturersByDepartment($departmentId))
            ->map(fn (array $lecturer): array => [
                'id' => (int) data_get($lecturer, 'id', 0),
                'code' => (string) data_get($lecturer, 'code', ''),
                'fullName' => trim((string) data_get($lecturer, 'fullName', '')),
                'departmentName' => (string) data_get($lecturer, 'departmentName', ''),
            ])
            ->filter(fn (array $lecturer): bool => $lecturer['id'] > 0 && $lecturer['code'] !== '')
            ->values()
            ->all();
    }

    public function createClass(int $tutorialPeriodId, array $data, int $userId): TutorialClass
    {
        $tutorialPeriod = $this->findAssignableTutorialPeriodOrFail($tutorialPeriodId);
        $courseCode = (string) $data['course_code'];

        $existingClass = TutorialClass::query()
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->where('course_code', $courseCode)
            ->first();

        if ($existingClass) {
            if ($existingClass->status === TutorialClassStatus::CANCELLED) {
                throw new ConflictHttpException(
                    'Tutorial class already exists in cancelled status. Please restore it instead of creating a new one'
                );
            }

            throw new ConflictHttpException('Tutorial class already exists for this course');
        }

        $course = collect(
            $this->departmentTutorialRegistrationService->getCourseRegistrationSummary($tutorialPeriod->id)
        )->firstWhere('courseCode', $courseCode);

        if ($course === null) {
            throw new NotFoundHttpException('Course registration summary not found for this tutorial period');
        }

        $studentCount = (int) data_get($course, 'studentCount', 0);

        if ($studentCount < 1) {
            throw new ConflictHttpException('Cannot create tutorial class without registered students');
        }

        $totalSessions = (int) $data['total_sessions'];
        $periodsPerSession = (int) $data['periods_per_session'];

        $tutorialClass = TutorialClass::create([
            'tutorial_period_id' => $tutorialPeriod->id,
            'course_code' => (string) data_get($course, 'courseCode', ''),
            'course_name' => (string) data_get($course, 'courseName', ''),
            'credits' => (int) data_get($course, 'credits', 0),
            'total_sessions' => $totalSessions,
            'periods_per_session' => $periodsPerSession,
            'total_periods' => $totalSessions * $periodsPerSession,
            'status' => TutorialClassStatus::PLANNED->value,
            'created_by' => $userId,
        ]);

        return $this->refreshClassResourceState($tutorialClass);
    }

    public function updateClass(int $classId, array $data): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        $this->ensureClassCanBeUpdated($tutorialClass);

        $totalSessions = (int) $data['total_sessions'];
        $periodsPerSession = (int) $data['periods_per_session'];

        $tutorialClass->fill([
            'total_sessions' => $totalSessions,
            'periods_per_session' => $periodsPerSession,
            'total_periods' => $totalSessions * $periodsPerSession,
        ]);
        $tutorialClass->save();

        return $this->refreshClassResourceState($tutorialClass);
    }

    public function cancelClass(int $classId): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        $this->ensureClassCanBeCancelled($tutorialClass);

        $tutorialClass->fill([
            'status' => TutorialClassStatus::CANCELLED->value,
            'cancelled_at' => now(),
        ]);
        $tutorialClass->save();

        return $this->refreshClassResourceState($tutorialClass);
    }

    public function restoreClass(int $classId): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        $this->ensureClassCanBeRestored($tutorialClass);

        $tutorialClass->fill([
            'status' => $this->resolveActiveStatus($tutorialClass, false, true)->value,
            'cancelled_at' => null,
        ]);
        $tutorialClass->save();

        return $this->refreshClassResourceState($tutorialClass);
    }

    public function assignLecturer(int $classId, int $lecturerId, ?int $departmentId): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        $this->ensureClassIsAssignable($tutorialClass);

        if ($departmentId === null) {
            throw new BadRequestHttpException('Không xác định được bộ môn của tài khoản hiện tại.');
        }

        $lecturer = collect($this->getLecturerOptions($departmentId))->firstWhere('id', $lecturerId);

        if ($lecturer === null) {
            throw new NotFoundHttpException('Lecturer not found');
        }

        $tutorialClass->fill([
            'lecturer_id' => (int) data_get($lecturer, 'id', 0),
            'lecturer_code' => (string) data_get($lecturer, 'code', ''),
            'lecturer_name' => (string) data_get($lecturer, 'fullName', ''),
            'assigned_at' => now(),
            'status' => $this->resolveActiveStatus($tutorialClass, true)->value,
        ]);
        $tutorialClass->save();

        return $this->refreshClassResourceState($tutorialClass);
    }

    public function addSchedule(int $classId, array $data): TutorialClassSchedule
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        $this->ensureClassCanManageSchedules($tutorialClass);

        $roomId = (int) $data['room_id'];
        $dayOfWeek = (int) $data['day_of_week'];
        $startPeriod = (int) $data['start_period'];
        $endPeriod = $startPeriod + ((int) $tutorialClass->periods_per_session) - 1;

        if ($endPeriod > 15) {
            throw new BadRequestHttpException('Tiết kết thúc không hợp lệ.');
        }

        $room = collect($this->getRoomOptions())->firstWhere('id', $roomId);

        if ($room === null) {
            throw new NotFoundHttpException('Room not found');
        }

        $this->ensureNoLecturerConflict($tutorialClass, $dayOfWeek, $startPeriod, $endPeriod);
        $this->ensureNoRoomConflict($tutorialClass, $roomId, $dayOfWeek, $startPeriod, $endPeriod);

        $schedule = $tutorialClass->schedules()->create([
            'room_id' => (int) data_get($room, 'id'),
            'room_code' => (string) data_get($room, 'code', ''),
            'room_name' => (string) data_get($room, 'name', ''),
            'room_capacity' => data_get($room, 'capacity') !== null
                ? (int) data_get($room, 'capacity')
                : null,
            'day_of_week' => $dayOfWeek,
            'start_period' => $startPeriod,
            'end_period' => $endPeriod,
        ]);

        $tutorialClass->loadCount('schedules');

        $tutorialClass->fill([
            'status' => $this->resolveActiveStatus($tutorialClass, true)->value,
        ]);
        $tutorialClass->save();

        return $schedule->fresh();
    }

    public function deleteSchedule(int $classId, int $scheduleId): TutorialClassSchedule
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        $this->ensureClassCanManageSchedules($tutorialClass);

        $schedule = $tutorialClass->schedules()->find($scheduleId);

        if (!$schedule) {
            throw new NotFoundHttpException('Tutorial class schedule not found');
        }

        $deletedSchedule = clone $schedule;
        $schedule->delete();

        $tutorialClass->loadCount('schedules');

        $tutorialClass->fill([
            'status' => $this->resolveActiveStatus($tutorialClass)->value,
        ]);
        $tutorialClass->save();

        return $deletedSchedule;
    }

    /**
     * @return array<int, array{id:int,classId:int,courseCode:string,courseName:string,lecturerId:int|null,lecturerName:string,roomCode:string,roomName:string,dayOfWeek:int,startPeriod:int,endPeriod:int}>
     */
    public function getWeeklyTimetable(int $tutorialPeriodId): array
    {
        $tutorialPeriod = $this->findAccessibleTutorialPeriodOrFail($tutorialPeriodId);

        return TutorialClassSchedule::query()
            ->with('tutorialClass')
            ->whereHas('tutorialClass', function (Builder $query) use ($tutorialPeriod): void {
                $query
                    ->where('tutorial_period_id', $tutorialPeriod->id)
                    ->where('status', TutorialClassStatus::SCHEDULED->value);
            })
            ->orderBy('day_of_week')
            ->orderBy('start_period')
            ->orderBy('room_code')
            ->get()
            ->map(function (TutorialClassSchedule $schedule): array {
                $tutorialClass = $schedule->tutorialClass;

                return [
                    'id' => $schedule->id,
                    'classId' => $tutorialClass->id,
                    'courseCode' => (string) $tutorialClass->course_code,
                    'courseName' => (string) $tutorialClass->course_name,
                    'lecturerId' => $tutorialClass->lecturer_id !== null
                        ? (int) $tutorialClass->lecturer_id
                        : null,
                    'lecturerName' => (string) ($tutorialClass->lecturer_name ?? ''),
                    'roomCode' => (string) ($schedule->room_code ?? ''),
                    'roomName' => (string) ($schedule->room_name ?? ''),
                    'dayOfWeek' => (int) $schedule->day_of_week,
                    'startPeriod' => (int) $schedule->start_period,
                    'endPeriod' => (int) $schedule->end_period,
                ];
            })
            ->all();
    }

    private function findAccessibleTutorialPeriodOrFail(int $tutorialPeriodId): TutorialPeriod
    {
        $tutorialPeriod = TutorialPeriod::query()->find($tutorialPeriodId);

        if (
            !$tutorialPeriod ||
            !in_array(
                $tutorialPeriod->status,
                [
                    TutorialPeriodStatus::ASSIGNING,
                    TutorialPeriodStatus::ONGOING,
                    TutorialPeriodStatus::CLOSED,
                ],
                true
            )
        ) {
            throw new NotFoundHttpException('Tutorial period not found');
        }

        return $tutorialPeriod;
    }

    private function findAssignableTutorialPeriodOrFail(int $tutorialPeriodId): TutorialPeriod
    {
        $tutorialPeriod = TutorialPeriod::query()->find($tutorialPeriodId);

        if (!$tutorialPeriod) {
            throw new NotFoundHttpException('Tutorial period not found');
        }

        if ($tutorialPeriod->status !== TutorialPeriodStatus::ASSIGNING) {
            throw new ConflictHttpException('Tutorial class can only be created during ASSIGNING status');
        }

        return $tutorialPeriod;
    }

    private function findManagedClassOrFail(int $classId): TutorialClass
    {
        $tutorialClass = TutorialClass::query()
            ->with(['tutorialPeriod', 'schedules'])
            ->withCount('schedules')
            ->find($classId);

        if (!$tutorialClass) {
            throw new NotFoundHttpException('Tutorial class not found');
        }

        return $tutorialClass;
    }

    private function findClassInAccessiblePeriodOrFail(int $classId): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        if (
            !$tutorialClass->tutorialPeriod ||
            !in_array(
                $tutorialClass->tutorialPeriod->status,
                [
                    TutorialPeriodStatus::ASSIGNING,
                    TutorialPeriodStatus::ONGOING,
                    TutorialPeriodStatus::CLOSED,
                ],
                true
            )
        ) {
            throw new NotFoundHttpException('Tutorial class not found');
        }

        return $tutorialClass;
    }

    private function ensureClassIsInAssigningPeriod(TutorialClass $tutorialClass, string $action): void
    {
        if ($tutorialClass->tutorialPeriod?->status !== TutorialPeriodStatus::ASSIGNING) {
            throw new ConflictHttpException(
                'Tutorial class can only be ' . $action . ' during ASSIGNING status'
            );
        }
    }

    private function ensureClassCanBeUpdated(TutorialClass $tutorialClass): void
    {
        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'updated');

        if ($tutorialClass->status !== TutorialClassStatus::PLANNED) {
            throw new BadRequestHttpException('Only planned tutorial classes can be updated');
        }
    }

    private function ensureClassCanBeCancelled(TutorialClass $tutorialClass): void
    {
        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'cancelled');

        if ($tutorialClass->status === TutorialClassStatus::CANCELLED) {
            throw new BadRequestHttpException('Cancelled tutorial classes cannot be cancelled again');
        }
    }

    private function ensureClassCanBeRestored(TutorialClass $tutorialClass): void
    {
        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'restored');

        if ($tutorialClass->status !== TutorialClassStatus::CANCELLED) {
            throw new BadRequestHttpException('Only cancelled tutorial classes can be restored');
        }
    }

    private function ensureClassIsAssignable(TutorialClass $tutorialClass): void
    {
        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'assigned');

        if ($tutorialClass->status === TutorialClassStatus::CANCELLED) {
            throw new BadRequestHttpException('Cancelled tutorial classes cannot be assigned');
        }
    }

    private function ensureClassCanManageSchedules(TutorialClass $tutorialClass): void
    {
        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'scheduled');

        if ($tutorialClass->status === TutorialClassStatus::CANCELLED) {
            throw new BadRequestHttpException('Cancelled tutorial classes cannot be scheduled');
        }

        if (!$this->hasLecturerAssigned($tutorialClass)) {
            throw new ConflictHttpException('Cần phân công giảng viên trước khi xếp lịch.');
        }
    }

    private function hasLecturerAssigned(TutorialClass $tutorialClass): bool
    {
        return $tutorialClass->lecturer_id !== null
            && trim((string) ($tutorialClass->lecturer_name ?? '')) !== '';
    }

    private function hasSchedules(TutorialClass $tutorialClass): bool
    {
        if (isset($tutorialClass->schedules_count)) {
            return (int) $tutorialClass->schedules_count > 0;
        }

        if ($tutorialClass->relationLoaded('schedules')) {
            return $tutorialClass->schedules->isNotEmpty();
        }

        return $tutorialClass->schedules()->exists();
    }

    private function resolveActiveStatus(
        TutorialClass $tutorialClass,
        bool $forceHasLecturer = false,
        bool $ignoreCancelledStatus = false
    ): TutorialClassStatus {
        if (
            !$ignoreCancelledStatus &&
            $tutorialClass->status === TutorialClassStatus::CANCELLED
        ) {
            return TutorialClassStatus::CANCELLED;
        }

        $hasLecturer = $forceHasLecturer || $this->hasLecturerAssigned($tutorialClass);
        $hasSchedules = $this->hasSchedules($tutorialClass);

        if ($hasLecturer && $hasSchedules) {
            return TutorialClassStatus::SCHEDULED;
        }

        if ($hasLecturer) {
            return TutorialClassStatus::ASSIGNED;
        }

        return TutorialClassStatus::PLANNED;
    }

    private function ensureNoLecturerConflict(
        TutorialClass $tutorialClass,
        int $dayOfWeek,
        int $startPeriod,
        int $endPeriod
    ): void {
        if ($tutorialClass->lecturer_id === null) {
            return;
        }

        $hasConflict = TutorialClassSchedule::query()
            ->where('day_of_week', $dayOfWeek)
            ->where('start_period', '<=', $endPeriod)
            ->where('end_period', '>=', $startPeriod)
            ->whereHas('tutorialClass', function (Builder $query) use ($tutorialClass): void {
                $query
                    ->where('tutorial_period_id', $tutorialClass->tutorial_period_id)
                    ->where('lecturer_id', $tutorialClass->lecturer_id)
                    ->where('status', '!=', TutorialClassStatus::CANCELLED->value);
            })
            ->exists();

        if ($hasConflict) {
            throw new ConflictHttpException('Giảng viên đã có lịch dạy trùng thời gian.');
        }
    }

    private function ensureNoRoomConflict(
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

    /**
     * @param Collection<int, TutorialClass> $classes
     * @return Collection<int, TutorialClass>
     */
    private function attachStudentCounts(int $tutorialPeriodId, Collection $classes): Collection
    {
        if ($classes->isEmpty()) {
            return $classes;
        }

        $studentCounts = TutorialRegistration::query()
            ->selectRaw('course_code, COUNT(*) as student_count')
            ->where('tutorial_period_id', $tutorialPeriodId)
            ->where('status', TutorialRegistrationStatus::REGISTERED->value)
            ->groupBy('course_code')
            ->pluck('student_count', 'course_code');

        return $classes->map(function (TutorialClass $tutorialClass) use ($studentCounts): TutorialClass {
            $tutorialClass->setAttribute(
                'student_count',
                (int) ($studentCounts[$tutorialClass->course_code] ?? 0)
            );

            return $tutorialClass;
        });
    }

    private function refreshClassResourceState(TutorialClass $tutorialClass): TutorialClass
    {
        return $this->attachStudentCounts(
            (int) $tutorialClass->tutorial_period_id,
            TutorialClass::query()
                ->withCount('schedules')
                ->with([
                    'schedules' => fn ($query) => $query
                        ->orderBy('day_of_week')
                        ->orderBy('start_period')
                        ->orderBy('room_code'),
                ])
                ->whereKey($tutorialClass->id)
                ->get()
        )->first();
    }
}
