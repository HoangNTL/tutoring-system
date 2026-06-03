<?php

namespace Tests\Feature\Department;

use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class DepartmentTutorialRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::fake(function (\Illuminate\Http\Client\Request $request) {
            $url = $request->url();

            if (str_contains($url, '/legacy/periods')) {
                return Http::response([
                    'success' => true,
                    'data' => [
                        ['id' => 296, 'name' => 'HK2 2024-2025'],
                        ['id' => 297, 'name' => 'HK1 2025-2026'],
                    ],
                ], 200);
            }

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

    public function test_unauthenticated_user_cannot_access_department_tutorial_registration_endpoints(): void
    {
        $this->getJson('/api/v1/department/tutorial-periods')->assertUnauthorized();
    }

    public function test_student_user_is_blocked(): void
    {
        $user = $this->createUser('student_dept_test', UserRole::STUDENT);

        $this
            ->actingAs($user, 'web')
            ->getJson('/api/v1/department/tutorial-periods')
            ->assertForbidden();
    }

    public function test_lecturer_user_is_blocked(): void
    {
        $user = $this->createUser('lecturer_dept_test', UserRole::LECTURER);

        $this
            ->actingAs($user, 'web')
            ->getJson('/api/v1/department/tutorial-periods')
            ->assertForbidden();
    }

    public function test_department_user_can_access_tutorial_period_options(): void
    {
        $department = $this->createUser('department_user', UserRole::DEPARTMENT);

        $allowed = $this->createTutorialPeriod(296, TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $blocked = $this->createTutorialPeriod(297, TutorialPeriodStatus::OPEN, 'Dot open');
        $closed = $this->createTutorialPeriod(296, TutorialPeriodStatus::CLOSED, 'Dot closed');

        $response = $this
            ->actingAs($department, 'web')
            ->getJson('/api/v1/department/tutorial-periods')
            ->assertOk();

        $data = collect($response->json('data'));

        $this->assertCount(2, $data);
        $this->assertTrue($data->contains(fn (array $item) => $item['id'] === $allowed->id && $item['status'] === 'ASSIGNING'));
        $this->assertTrue($data->contains(fn (array $item) => $item['id'] === $closed->id && $item['status'] === 'CLOSED'));
        $this->assertFalse($data->contains(fn (array $item) => $item['id'] === $blocked->id));
        $this->assertSame('HK2 2024-2025', $data->firstWhere('id', $allowed->id)['academicPeriod']['name']);
    }

    public function test_period_options_return_only_assigning_ongoing_and_closed(): void
    {
        $department = $this->createUser('department_statuses', UserRole::DEPARTMENT);

        $this->createTutorialPeriod(296, TutorialPeriodStatus::DRAFT, 'Draft');
        $this->createTutorialPeriod(296, TutorialPeriodStatus::OPEN, 'Open');
        $this->createTutorialPeriod(296, TutorialPeriodStatus::ASSIGNING, 'Assigning');
        $this->createTutorialPeriod(296, TutorialPeriodStatus::ONGOING, 'Ongoing');
        $this->createTutorialPeriod(296, TutorialPeriodStatus::CLOSED, 'Closed');
        $this->createTutorialPeriod(296, TutorialPeriodStatus::CANCELLED, 'Cancelled');

        $response = $this
            ->actingAs($department, 'web')
            ->getJson('/api/v1/department/tutorial-periods')
            ->assertOk();

        $statuses = collect($response->json('data'))->pluck('status')->all();

        $this->assertSame(['CLOSED', 'ONGOING', 'ASSIGNING'], $statuses);
    }

    public function test_summary_returns_only_registered_registrations_and_groups_by_course(): void
    {
        $department = $this->createUser('department_summary', UserRole::DEPARTMENT);
        $studentA = $this->createUser('0288667', UserRole::STUDENT);
        $studentB = $this->createUser('0288668', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(296, TutorialPeriodStatus::ASSIGNING, 'Dot HK2');

        $this->createRegistration($tutorialPeriod->id, $studentA->id, '020205', 'An toàn lao động', 2, TutorialRegistrationStatus::REGISTERED);
        $this->createRegistration($tutorialPeriod->id, $studentB->id, '020205', 'An toàn lao động', 2, TutorialRegistrationStatus::REGISTERED);
        $this->createRegistration($tutorialPeriod->id, $studentB->id, '030101', 'Toán cao cấp', 3, TutorialRegistrationStatus::REGISTERED);
        $this->createRegistration($tutorialPeriod->id, $studentA->id, '999999', 'Mon huy', 1, TutorialRegistrationStatus::CANCELLED);

        $response = $this
            ->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/course-registrations")
            ->assertOk();

        $data = $response->json('data');

        $this->assertCount(2, $data);
        $this->assertSame('020205', $data[0]['courseCode']);
        $this->assertSame(2, $data[0]['studentCount']);
        $this->assertSame('030101', $data[1]['courseCode']);
    }

    public function test_student_list_returns_only_students_for_selected_course(): void
    {
        $department = $this->createUser('department_students', UserRole::DEPARTMENT);
        $studentA = $this->createUser('0288667', UserRole::STUDENT, 101, null, null);
        $studentB = $this->createUser('0288668', UserRole::STUDENT, null, null, null);
        $studentC = $this->createUser('0288669', UserRole::STUDENT, 103, null, null);
        $tutorialPeriod = $this->createTutorialPeriod(296, TutorialPeriodStatus::ONGOING, 'Dot HK2');

        $this->createRegistration($tutorialPeriod->id, $studentA->id, '020205', 'An toàn lao động', 2, TutorialRegistrationStatus::REGISTERED, '2026-06-03 10:00:00');
        $this->createRegistration($tutorialPeriod->id, $studentB->id, '020205', 'An toàn lao động', 2, TutorialRegistrationStatus::REGISTERED, '2026-06-03 11:00:00');
        $this->createRegistration($tutorialPeriod->id, $studentB->id, '030101', 'Toán cao cấp', 3, TutorialRegistrationStatus::REGISTERED, '2026-06-03 12:00:00');
        $this->createRegistration($tutorialPeriod->id, $studentC->id, '020205', 'An toàn lao động', 2, TutorialRegistrationStatus::CANCELLED, '2026-06-03 13:00:00');

        $response = $this
            ->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/course-registrations/020205/students")
            ->assertOk();

        $data = $response->json('data');

        $this->assertCount(2, $data);
        $this->assertSame('5001866', $data[0]['studentCode']);
        $this->assertSame('Nguyễn Văn A', $data[0]['fullName']);
        $this->assertSame('2026-06-03 10:00:00', $data[0]['registeredAt']);
        $this->assertSame('0288668', $data[1]['studentCode']);
        $this->assertSame('Trần Thị B', $data[1]['fullName']);
        $this->assertArrayNotHasKey('password_hash', $data[0]);
        $this->assertArrayNotHasKey('student_id', $data[0]);
        $this->assertArrayNotHasKey('lecturer_id', $data[0]);
        $this->assertArrayNotHasKey('department_id', $data[0]);
        $this->assertArrayNotHasKey('username', $data[0]);
    }

    public function test_student_list_falls_back_gracefully_when_legacy_lookup_fails(): void
    {
        $department = $this->createUser('department_students_fallback', UserRole::DEPARTMENT);
        $student = $this->createUser('5001999', UserRole::STUDENT, 999, null, null);
        $tutorialPeriod = $this->createTutorialPeriod(296, TutorialPeriodStatus::ONGOING, 'Dot fallback');

        $this->createRegistration(
            $tutorialPeriod->id,
            $student->id,
            '020205',
            'An toàn lao động',
            2,
            TutorialRegistrationStatus::REGISTERED,
            '2026-06-03 10:00:00'
        );

        $response = $this
            ->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/course-registrations/020205/students")
            ->assertOk();

        $data = $response->json('data');

        $this->assertCount(1, $data);
        $this->assertSame('5001999', $data[0]['studentCode']);
        $this->assertNull($data[0]['fullName']);
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
}
