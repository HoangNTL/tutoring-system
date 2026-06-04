<?php

namespace Tests\Feature\Department;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialClass;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentTutorialClassTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_blocked(): void
    {
        $this->getJson('/api/v1/department/tutorial-periods/1/classes')->assertUnauthorized();
    }

    public function test_student_is_blocked(): void
    {
        $user = $this->createUser('student_class_test', UserRole::STUDENT);

        $this->actingAs($user, 'web')
            ->getJson('/api/v1/department/tutorial-periods/1/classes')
            ->assertForbidden();
    }

    public function test_lecturer_is_blocked(): void
    {
        $user = $this->createUser('lecturer_class_test', UserRole::LECTURER);

        $this->actingAs($user, 'web')
            ->getJson('/api/v1/department/tutorial-periods/1/classes')
            ->assertForbidden();
    }

    public function test_department_can_list_classes_with_computed_student_count(): void
    {
        $department = $this->createUser('department_list_classes', UserRole::DEPARTMENT);
        $studentA = $this->createUser('student_list_a', UserRole::STUDENT);
        $studentB = $this->createUser('student_list_b', UserRole::STUDENT);
        $studentC = $this->createUser('student_list_c', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');

        $this->createRegistration($tutorialPeriod->id, $studentA->id, '020205', 'An toàn lao động', 2);
        $this->createRegistration($tutorialPeriod->id, $studentB->id, '020205', 'An toàn lao động', 2);
        $this->createRegistration(
            $tutorialPeriod->id,
            $studentC->id,
            '020205',
            'An toàn lao động',
            2,
            TutorialRegistrationStatus::CANCELLED
        );

        $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);

        $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes")
            ->assertOk()
            ->assertJsonPath('data.0.courseCode', '020205')
            ->assertJsonPath('data.0.studentCount', 2)
            ->assertJsonPath('data.0.totalPeriods', 15);
    }

    public function test_department_can_create_class_for_registered_course(): void
    {
        $department = $this->createUser('department_create_class', UserRole::DEPARTMENT);
        $student = $this->createUser('student_create_class', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');

        $this->createRegistration($tutorialPeriod->id, $student->id, '020205', 'An toàn lao động', 2);

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes", [
                'courseCode' => '020205',
                'totalSessions' => 5,
                'periodsPerSession' => 3,
            ])
            ->assertCreated()
            ->assertJsonPath('data.courseCode', '020205')
            ->assertJsonPath('data.studentCount', 1)
            ->assertJsonPath('data.totalPeriods', 15)
            ->assertJsonPath('data.status', TutorialClassStatus::PLANNED->name)
            ->assertJsonPath('data.cancelledAt', null);

        $this->assertDatabaseHas('tutorial_classes', [
            'tutorial_period_id' => $tutorialPeriod->id,
            'course_code' => '020205',
            'course_name' => 'An toàn lao động',
            'credits' => 2,
            'total_sessions' => 5,
            'periods_per_session' => 3,
            'total_periods' => 15,
            'status' => TutorialClassStatus::PLANNED->value,
            'created_by' => $department->id,
            'cancelled_at' => null,
        ]);
    }

    public function test_cannot_create_class_for_course_with_no_registered_students(): void
    {
        $department = $this->createUser('department_no_reg', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes", [
                'courseCode' => '020205',
                'totalSessions' => 5,
                'periodsPerSession' => 3,
            ])
            ->assertNotFound();
    }

    public function test_cannot_create_duplicate_class_for_same_period_and_course(): void
    {
        $department = $this->createUser('department_dup', UserRole::DEPARTMENT);
        $student = $this->createUser('student_dup', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');

        $this->createRegistration($tutorialPeriod->id, $student->id, '020205', 'An toàn lao động', 2);
        $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes", [
                'courseCode' => '020205',
                'totalSessions' => 5,
                'periodsPerSession' => 3,
            ])
            ->assertConflict();
    }

    public function test_cannot_create_duplicate_class_when_cancelled_class_exists(): void
    {
        $department = $this->createUser('department_dup_cancelled', UserRole::DEPARTMENT);
        $student = $this->createUser('student_dup_cancelled', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');

        $this->createRegistration($tutorialPeriod->id, $student->id, '020205', 'An toàn lao động', 2);
        $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            TutorialClassStatus::CANCELLED,
            '2026-06-04 09:00:00'
        );

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes", [
                'courseCode' => '020205',
                'totalSessions' => 5,
                'periodsPerSession' => 3,
            ])
            ->assertConflict()
            ->assertJsonPath(
                'message',
                'Tutorial class already exists in cancelled status. Please restore it instead of creating a new one'
            );
    }

    public function test_cannot_create_class_if_tutorial_period_is_not_assigning(): void
    {
        $department = $this->createUser('department_not_assigning', UserRole::DEPARTMENT);
        $student = $this->createUser('student_not_assigning', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ONGOING, 'Dot ongoing');

        $this->createRegistration($tutorialPeriod->id, $student->id, '020205', 'An toàn lao động', 2);

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes", [
                'courseCode' => '020205',
                'totalSessions' => 5,
                'periodsPerSession' => 3,
            ])
            ->assertConflict();
    }

    public function test_department_can_update_planned_class_during_assigning(): void
    {
        $department = $this->createUser('department_update_class', UserRole::DEPARTMENT);
        $student = $this->createUser('student_update_class', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');

        $this->createRegistration($tutorialPeriod->id, $student->id, '020205', 'An toàn lao động', 2);
        $tutorialClass = $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);

        $this->actingAs($department, 'web')
            ->putJson("/api/v1/department/classes/{$tutorialClass->id}", [
                'totalSessions' => 6,
                'periodsPerSession' => 2,
            ])
            ->assertOk()
            ->assertJsonPath('data.totalSessions', 6)
            ->assertJsonPath('data.periodsPerSession', 2)
            ->assertJsonPath('data.totalPeriods', 12)
            ->assertJsonPath('data.studentCount', 1)
            ->assertJsonPath('data.status', TutorialClassStatus::PLANNED->name);

        $this->assertDatabaseHas('tutorial_classes', [
            'id' => $tutorialClass->id,
            'total_sessions' => 6,
            'periods_per_session' => 2,
            'total_periods' => 12,
            'status' => TutorialClassStatus::PLANNED->value,
        ]);
    }

    public function test_cannot_update_class_when_tutorial_period_is_not_assigning(): void
    {
        $department = $this->createUser('department_update_blocked', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ONGOING, 'Dot ongoing');
        $tutorialClass = $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);

        $this->actingAs($department, 'web')
            ->putJson("/api/v1/department/classes/{$tutorialClass->id}", [
                'totalSessions' => 6,
                'periodsPerSession' => 2,
            ])
            ->assertConflict();
    }

    public function test_cannot_update_cancelled_class(): void
    {
        $department = $this->createUser('department_update_cancelled', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            TutorialClassStatus::CANCELLED,
            '2026-06-04 09:00:00'
        );

        $this->actingAs($department, 'web')
            ->putJson("/api/v1/department/classes/{$tutorialClass->id}", [
                'totalSessions' => 6,
                'periodsPerSession' => 2,
            ])
            ->assertBadRequest();
    }

    public function test_department_can_cancel_planned_class_during_assigning(): void
    {
        $department = $this->createUser('department_cancel_class', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);

        $this->actingAs($department, 'web')
            ->patchJson("/api/v1/department/classes/{$tutorialClass->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', TutorialClassStatus::CANCELLED->name)
            ->assertJsonPath('data.cancelledAt', '2026-06-04 00:00:00');

        $this->assertDatabaseHas('tutorial_classes', [
            'id' => $tutorialClass->id,
            'status' => TutorialClassStatus::CANCELLED->value,
            'cancelled_at' => '2026-06-04 00:00:00',
        ]);
    }

    public function test_cannot_cancel_class_when_tutorial_period_is_not_assigning(): void
    {
        $department = $this->createUser('department_cancel_blocked', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::CLOSED, 'Dot closed');
        $tutorialClass = $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);

        $this->actingAs($department, 'web')
            ->patchJson("/api/v1/department/classes/{$tutorialClass->id}/cancel")
            ->assertConflict();
    }

    public function test_cancelled_class_remains_visible_in_list_and_is_not_editable(): void
    {
        $department = $this->createUser('department_list_cancelled', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $cancelledClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            TutorialClassStatus::CANCELLED,
            '2026-06-04 09:00:00'
        );

        $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes")
            ->assertOk()
            ->assertJsonPath('data.0.id', $cancelledClass->id)
            ->assertJsonPath('data.0.status', TutorialClassStatus::CANCELLED->name)
            ->assertJsonPath('data.0.cancelledAt', '2026-06-04 09:00:00');
    }

    public function test_department_can_restore_cancelled_class_during_assigning(): void
    {
        $department = $this->createUser('department_restore_class', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            TutorialClassStatus::CANCELLED,
            '2026-06-04 09:00:00'
        );

        $this->actingAs($department, 'web')
            ->patchJson("/api/v1/department/classes/{$tutorialClass->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.status', TutorialClassStatus::PLANNED->name)
            ->assertJsonPath('data.cancelledAt', null);

        $this->assertDatabaseHas('tutorial_classes', [
            'id' => $tutorialClass->id,
            'status' => TutorialClassStatus::PLANNED->value,
            'cancelled_at' => null,
        ]);
    }

    public function test_cannot_restore_planned_class(): void
    {
        $department = $this->createUser('department_restore_planned', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);

        $this->actingAs($department, 'web')
            ->patchJson("/api/v1/department/classes/{$tutorialClass->id}/restore")
            ->assertBadRequest();
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->travelTo(now()->setDate(2026, 6, 4)->startOfDay());
    }

    protected function tearDown(): void
    {
        $this->travelBack();
        parent::tearDown();
    }

    private function createUser(string $username, UserRole $role): User
    {
        return User::create([
            'username' => $username,
            'password_hash' => 'password123',
            'role' => $role,
        ]);
    }

    private function createTutorialPeriod(TutorialPeriodStatus $status, string $title): TutorialPeriod
    {
        return TutorialPeriod::create([
            'academic_period_id' => 296,
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
        TutorialRegistrationStatus $status = TutorialRegistrationStatus::REGISTERED
    ): TutorialRegistration {
        return TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriodId,
            'user_id' => $userId,
            'course_code' => $courseCode,
            'course_name' => $courseName,
            'credits' => $credits,
            'status' => $status,
            'registered_at' => '2026-06-03 10:00:00',
            'cancelled_at' => $status === TutorialRegistrationStatus::CANCELLED ? '2026-06-03 12:00:00' : null,
        ]);
    }

    private function createTutorialClass(
        int $tutorialPeriodId,
        string $courseCode,
        string $courseName,
        int $totalSessions,
        int $periodsPerSession,
        TutorialClassStatus $status = TutorialClassStatus::PLANNED,
        ?string $cancelledAt = null
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
            'created_by' => $this->createUser('creator_' . $courseCode . '_' . $tutorialPeriodId, UserRole::DEPARTMENT)->id,
        ]);
    }
}
