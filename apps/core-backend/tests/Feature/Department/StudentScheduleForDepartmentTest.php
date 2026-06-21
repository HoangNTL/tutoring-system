<?php

namespace Tests\Feature\Department;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialClass;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\TutorialClassSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class StudentScheduleForDepartmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake(function (\Illuminate\Http\Client\Request $request) {
            $url = $request->url();

            if (str_contains($url, '/legacy/students/by-id/101')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        'studentCode' => '5001866',
                        'lastName' => 'Nguyễn Văn',
                        'firstName' => 'A',
                        'fullName' => 'Nguyễn Văn A',
                    ],
                ], 200);
            }

            if (str_contains($url, '/legacy/students/by-code/0288668')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        'studentCode' => '0288668',
                        'lastName' => 'Trần Thị',
                        'firstName' => 'B',
                        'fullName' => 'Trần Thị B',
                    ],
                ], 200);
            }

            return Http::response([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        });
    }

    public function test_unauthenticated_user_cannot_access_student_schedules(): void
    {
        $this->getJson('/api/v1/department/classes/1/student-schedules')->assertUnauthorized();
    }

    public function test_non_department_user_cannot_access_student_schedules(): void
    {
        $student = $this->createUser('student_test', UserRole::STUDENT);
        $this->actingAs($student, 'web')
            ->getJson('/api/v1/department/classes/1/student-schedules')
            ->assertForbidden();
    }

    public function test_department_user_can_access_student_schedules_but_class_not_found(): void
    {
        $department = $this->createUser('dept_test', UserRole::DEPARTMENT);
        $this->actingAs($department, 'web')
            ->getJson('/api/v1/department/classes/999/student-schedules')
            ->assertNotFound();
    }

    public function test_department_gets_empty_schedules_if_no_other_registrations(): void
    {
        $department = $this->createUser('dept_user', UserRole::DEPARTMENT, null, null, 1);
        $student = $this->createUser('0288668', UserRole::STUDENT);

        $period = $this->createTutorialPeriod(296, TutorialPeriodStatus::ASSIGNING, 'Dot 1');
        $class = $this->createTutorialClass($period->id, '020205', 'An toàn lao động', 5, 3, TutorialClassStatus::PLANNED, null, 1);

        $this->createRegistration($period->id, $student->id, '020205', 'An toàn lao động', 2, TutorialRegistrationStatus::REGISTERED);

        $response = $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/classes/{$class->id}/student-schedules")
            ->assertOk();

        $response->assertJson([
            'success' => true,
            'data' => [
                'totalStudents' => 1,
                'busySlots' => [],
            ],
        ]);
    }

    public function test_student_schedules_returns_conflicts_correctly(): void
    {
        $department = $this->createUser('dept_user_2', UserRole::DEPARTMENT, null, null, 1);
        $student = $this->createUser('0288668', UserRole::STUDENT); // Resolved name: Trần Thị B

        $period = $this->createTutorialPeriod(296, TutorialPeriodStatus::ASSIGNING, 'Dot 1');

        // Class A: class we want to check schedules for (An toàn lao động)
        $classA = $this->createTutorialClass($period->id, '020205', 'An toàn lao động', 5, 3, TutorialClassStatus::PLANNED, null, 1);

        // Class B: another class in same period (Toán cao cấp)
        $classB = $this->createTutorialClass($period->id, '030101', 'Toán cao cấp', 5, 3, TutorialClassStatus::PLANNED, null, 1);

        // Class C: another class in same period, but cancelled
        $classC = $this->createTutorialClass($period->id, '040404', 'Lý thuyết mạch', 5, 3, TutorialClassStatus::CANCELLED, '2026-06-20 12:00:00', 1);

        // Student is registered for both A, B, and C
        $this->createRegistration($period->id, $student->id, '020205', 'An toàn lao động', 2, TutorialRegistrationStatus::REGISTERED);
        $this->createRegistration($period->id, $student->id, '030101', 'Toán cao cấp', 3, TutorialRegistrationStatus::REGISTERED);
        $this->createRegistration($period->id, $student->id, '040404', 'Lý thuyết mạch', 3, TutorialRegistrationStatus::REGISTERED);

        // Create schedule for B (day 3, period 1)
        TutorialClassSchedule::create([
            'tutorial_class_id' => $classB->id,
            'day_of_week' => 3,
            'start_period' => 1,
            'room' => 'A101',
        ]);

        // Create schedule for C (day 4, period 4) - should be ignored since class is CANCELLED
        TutorialClassSchedule::create([
            'tutorial_class_id' => $classC->id,
            'day_of_week' => 4,
            'start_period' => 4,
            'room' => 'A102',
        ]);

        $response = $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/classes/{$classA->id}/student-schedules")
            ->assertOk();

        $response->assertJson([
            'success' => true,
            'data' => [
                'totalStudents' => 1,
                'busySlots' => [
                    [
                        'dayOfWeek' => 3,
                        'startPeriod' => 1,
                        'conflictCount' => 1,
                        'students' => ['Trần Thị B'],
                    ]
                ],
            ],
        ]);
    }

    private function createUser(
        string $username,
        UserRole $role,
        ?int $studentId = null,
        ?int $lecturerId = null,
        ?int $departmentId = null
    ): User {
        return User::create([
            'username' => $username,
            'password_hash' => 'password123',
            'role' => $role,
            'student_id' => $studentId,
            'lecturer_id' => $lecturerId,
            'department_id' => $departmentId,
        ]);
    }

    private function createTutorialPeriod(
        int $academicPeriodId,
        TutorialPeriodStatus $status,
        string $title
    ): TutorialPeriod {
        return TutorialPeriod::create([
            'academic_period_id' => $academicPeriodId,
            'title' => $title,
            'description' => $title . ' description',
            'registration_start_at' => '2026-06-01 08:00:00',
            'registration_end_at' => '2026-06-05 17:00:00',
            'study_start_at' => '2026-06-07 08:00:00',
            'study_end_at' => '2026-06-20 17:00:00',
            'status' => $status,
            'created_by' => $this->createUser('admin_for_' . $title, UserRole::ADMIN)->id,
        ]);
    }

    private function createRegistration(
        int $tutorialPeriodId,
        int $userId,
        string $courseCode,
        string $courseName,
        int $credits,
        TutorialRegistrationStatus $status,
        string $registeredAt = '2026-06-03 10:00:00'
    ): TutorialRegistration {
        return TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriodId,
            'user_id' => $userId,
            'course_code' => $courseCode,
            'course_name' => $courseName,
            'credits' => $credits,
            'status' => $status,
            'registered_at' => $registeredAt,
            'cancelled_at' => $status === TutorialRegistrationStatus::CANCELLED ? '2026-06-03 14:00:00' : null,
        ]);
    }

    private function createTutorialClass(
        int $tutorialPeriodId,
        string $courseCode,
        string $courseName,
        int $totalSessions,
        int $periodsPerSession,
        TutorialClassStatus $status = TutorialClassStatus::PLANNED,
        ?string $cancelledAt = null,
        ?int $departmentId = null
    ): TutorialClass {
        return TutorialClass::create([
            'tutorial_period_id' => $tutorialPeriodId,
            'course_code' => $courseCode,
            'course_name' => $courseName,
            'credits' => 2,
            'total_sessions' => $totalSessions,
            'periods_per_session' => $periodsPerSession,
            'total_periods' => $totalSessions * $periodsPerSession,
            'status' => $status,
            'cancelled_at' => $cancelledAt,
            'department_id' => $departmentId,
            'created_by' => $this->createUser('creator_' . $courseCode . '_' . $tutorialPeriodId, UserRole::DEPARTMENT, $departmentId)->id,
        ]);
    }
}
