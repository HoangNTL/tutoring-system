<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialClass;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Enums\TutorialRegistrationStatus;
use Illuminate\Support\Facades\DB;

class DepartmentTutorialClassService
{
    public function __construct(
        private DepartmentTutorialRegistrationService $departmentTutorialRegistrationService
    ) {}

    /**
     * @return array<int, TutorialClass>
     */
    public function getClasses(int $tutorialPeriodId, ?int $departmentId = null): array
    {
        $tutorialPeriod = $this->findAccessibleTutorialPeriodOrFail($tutorialPeriodId);

        $classes = TutorialClass::query()
            ->with('schedules')
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->when($departmentId !== null, function ($query) use ($departmentId) {
                return $query->where('department_id', $departmentId);
            })
            ->orderByRaw(
                'CASE WHEN status = ? THEN 0 ELSE 1 END',
                [TutorialClassStatus::PLANNED->value]
            )
            ->orderBy('course_name')
            ->get();

        return $this->attachStudentCounts($tutorialPeriod->id, $classes, $departmentId)->all();
    }

    public function createClass(int $tutorialPeriodId, array $data, int $userId, ?int $departmentId): TutorialClass
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
            'department_id' => $departmentId,
            'course_code' => (string) data_get($course, 'courseCode', ''),
            'course_name' => (string) data_get($course, 'courseName', ''),
            'credits' => (int) data_get($course, 'credits', 0),
            'total_sessions' => $totalSessions,
            'periods_per_session' => $periodsPerSession,
            'total_periods' => $totalSessions * $periodsPerSession,
            'status' => TutorialClassStatus::PLANNED->value,
            'cancelled_at' => null,
            'created_by' => $userId,
        ]);

        return $this->attachStudentCount($tutorialClass);
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

        return $this->attachStudentCount($tutorialClass);
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

        return $this->attachStudentCount($tutorialClass);
    }

    public function restoreClass(int $classId): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        $this->ensureClassCanBeRestored($tutorialClass);

        $tutorialClass->fill([
            'status' => TutorialClassStatus::PLANNED->value,
            'cancelled_at' => null,
        ]);
        $tutorialClass->save();

        return $this->attachStudentCount($tutorialClass);
    }

    public function updateClassSchedule(int $classId, array $data, ?int $departmentId = null): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        if ($departmentId !== null && $tutorialClass->department_id !== $departmentId) {
            throw new NotFoundHttpException('Tutorial class not found for this department');
        }

        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'scheduled');

        if ($tutorialClass->status !== TutorialClassStatus::PLANNED) {
            throw new BadRequestHttpException('Only planned tutorial classes can be scheduled');
        }

        $schedules = $data['schedules'] ?? [];

        // Self conflict check in input (ensure no duplicates)
        $slots = [];
        foreach ($schedules as $slot) {
            $key = $slot['day_of_week'] . '-' . $slot['start_period'];
            if (isset($slots[$key])) {
                throw new ConflictHttpException('Không thể xếp cùng một thời gian cho hai buổi học khác nhau của lớp.');
            }
            $slots[$key] = true;
        }

        // Validate conflict for each slot
        foreach ($schedules as $slot) {
            // Room conflict check
            $roomConflict = DB::table('tutorial_class_schedules as s')
                ->join('tutorial_classes as c', 's.tutorial_class_id', '=', 'c.id')
                ->where('c.tutorial_period_id', $tutorialClass->tutorial_period_id)
                ->where('c.id', '!=', $classId)
                ->where('c.status', '!=', TutorialClassStatus::CANCELLED->value)
                ->where('s.day_of_week', (int) $slot['day_of_week'])
                ->where('s.start_period', (int) $slot['start_period'])
                ->where('s.room', $slot['room'])
                ->exists();

            if ($roomConflict) {
                throw new ConflictHttpException('Phòng học ' . $slot['room'] . ' đã có lớp khác đăng ký vào thời gian này.');
            }

            // Lecturer conflict check
            if ($tutorialClass->lecturer_id !== null) {
                $lecturerConflict = DB::table('tutorial_class_schedules as s')
                    ->join('tutorial_classes as c', 's.tutorial_class_id', '=', 'c.id')
                    ->where('c.tutorial_period_id', $tutorialClass->tutorial_period_id)
                    ->where('c.id', '!=', $classId)
                    ->where('c.status', '!=', TutorialClassStatus::CANCELLED->value)
                    ->where('c.lecturer_id', $tutorialClass->lecturer_id)
                    ->where('s.day_of_week', (int) $slot['day_of_week'])
                    ->where('s.start_period', (int) $slot['start_period'])
                    ->exists();

                if ($lecturerConflict) {
                    throw new ConflictHttpException('Giảng viên đã có lịch dạy lớp khác vào thời gian này.');
                }
            }
        }

        // Sync schedules in transaction
        DB::transaction(function () use ($tutorialClass, $schedules) {
            $tutorialClass->schedules()->delete();
            foreach ($schedules as $slot) {
                $tutorialClass->schedules()->create([
                    'day_of_week' => (int) $slot['day_of_week'],
                    'start_period' => (int) $slot['start_period'],
                    'room' => (string) $slot['room'],
                ]);
            }
        });

        // Reload schedules relation
        $tutorialClass->load('schedules');

        return $this->attachStudentCount($tutorialClass);
    }

    public function updateClassLecturer(int $classId, array $data, ?int $departmentId = null): TutorialClass
    {
        $tutorialClass = $this->findManagedClassOrFail($classId);

        if ($departmentId !== null && $tutorialClass->department_id !== $departmentId) {
            throw new NotFoundHttpException('Tutorial class not found for this department');
        }

        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'assigned');

        if ($tutorialClass->status !== TutorialClassStatus::PLANNED) {
            throw new BadRequestHttpException('Only planned tutorial classes can have lecturers assigned');
        }

        // Lecturer conflict check if schedule is already configured
        $currentClassSchedules = $tutorialClass->schedules;
        if ($currentClassSchedules->isNotEmpty()) {
            foreach ($currentClassSchedules as $slot) {
                $lecturerConflict = DB::table('tutorial_class_schedules as s')
                    ->join('tutorial_classes as c', 's.tutorial_class_id', '=', 'c.id')
                    ->where('c.tutorial_period_id', $tutorialClass->tutorial_period_id)
                    ->where('c.id', '!=', $classId)
                    ->where('c.status', '!=', TutorialClassStatus::CANCELLED->value)
                    ->where('c.lecturer_id', (int) $data['lecturer_id'])
                    ->where('s.day_of_week', $slot->day_of_week)
                    ->where('s.start_period', $slot->start_period)
                    ->exists();

                if ($lecturerConflict) {
                    throw new ConflictHttpException('Giảng viên đã có lịch dạy lớp khác vào thời gian này.');
                }
            }
        }

        $tutorialClass->fill([
            'lecturer_id' => (int) $data['lecturer_id'],
            'lecturer_name' => (string) $data['lecturer_name'],
        ]);
        $tutorialClass->save();

        return $this->attachStudentCount($tutorialClass);
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
            ->find($classId);

        if (!$tutorialClass) {
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

        if ($tutorialClass->status !== TutorialClassStatus::PLANNED) {
            throw new BadRequestHttpException('Only planned tutorial classes can be cancelled');
        }
    }

    private function ensureClassCanBeRestored(TutorialClass $tutorialClass): void
    {
        $this->ensureClassIsInAssigningPeriod($tutorialClass, 'restored');

        if ($tutorialClass->status !== TutorialClassStatus::CANCELLED) {
            throw new BadRequestHttpException('Only cancelled tutorial classes can be restored');
        }
    }

    /**
     * @param Collection<int, TutorialClass> $classes
     * @return Collection<int, TutorialClass>
     */
    private function attachStudentCounts(int $tutorialPeriodId, Collection $classes, ?int $departmentId = null): Collection
    {
        if ($classes->isEmpty()) {
            return $classes;
        }

        $studentCounts = TutorialRegistration::query()
            ->selectRaw('course_code, COUNT(*) as student_count')
            ->where('tutorial_period_id', $tutorialPeriodId)
            ->where('status', TutorialRegistrationStatus::REGISTERED->value)
            ->when($departmentId !== null, function ($query) use ($departmentId) {
                return $query->where('department_id', $departmentId);
            })
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

    private function attachStudentCount(TutorialClass $tutorialClass): TutorialClass
    {
        return $this->attachStudentCounts(
            (int) $tutorialClass->tutorial_period_id,
            collect([$tutorialClass]),
            $tutorialClass->department_id
        )->first();
    }
}
