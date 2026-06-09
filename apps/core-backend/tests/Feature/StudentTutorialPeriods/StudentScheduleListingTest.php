<?php

namespace Tests\Feature\StudentTutorialPeriods;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialClass;
use App\Models\TutorialClassSchedule;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentScheduleListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_blocked(): void
    {
        $this->getJson('/api/v1/student/schedules')->assertUnauthorized();
    }

    public function test_non_student_user_is_blocked(): void
    {
        $lecturer = $this->createUser('lecturer_schedule_blocked', UserRole::LECTURER, [
            'lecturer_id' => 11,
        ]);

        $this->actingAs($lecturer, 'web')
            ->getJson('/api/v1/student/schedules')
            ->assertForbidden();
    }

    public function test_student_can_list_registered_scheduled_classes_with_study_range(): void
    {
        $student = $this->createUser('student_schedule_viewer', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ONGOING, 'Đợt phụ đạo HK2');
        $draftPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::DRAFT, 'Đợt nháp');

        $this->createRegistration(
            $tutorialPeriod->id,
            $student->id,
            'INT1301',
            'Lập trình web',
            3,
            TutorialRegistrationStatus::REGISTERED
        );
        $this->createRegistration(
            $tutorialPeriod->id,
            $student->id,
            'INT1302',
            'Kiểm thử phần mềm',
            2,
            TutorialRegistrationStatus::CANCELLED
        );

        $matchedClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            'INT1301',
            'Lập trình web',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 21,
                'lecturer_name' => 'Nguyễn Văn Hùng',
            ]
        );
        $cancelledRegistrationClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            'INT1302',
            'Kiểm thử phần mềm',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 22,
                'lecturer_name' => 'Trần Thị B',
            ]
        );
        $unregisteredClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            'INT1303',
            'Mạng máy tính',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 23,
                'lecturer_name' => 'Lê Văn C',
            ]
        );
        $draftPeriodClass = $this->createTutorialClass(
            $draftPeriod->id,
            'INT1301',
            'Lập trình web',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 24,
                'lecturer_name' => 'Phạm Văn D',
            ]
        );

        $matchedSchedule = $this->createSchedule($matchedClass->id, 2, 1, 3, '311.H1');
        $this->createSchedule($cancelledRegistrationClass->id, 3, 4, 6, '312.H1');
        $this->createSchedule($unregisteredClass->id, 4, 7, 9, '313.H1');
        $this->createSchedule($draftPeriodClass->id, 5, 10, 12, '314.H1');

        $this->actingAs($student, 'web')
            ->getJson('/api/v1/student/schedules')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonFragment([
                'id' => $matchedSchedule->id,
                'classId' => $matchedClass->id,
                'tutorialPeriodId' => $tutorialPeriod->id,
                'tutorialPeriodTitle' => 'Đợt phụ đạo HK2',
                'courseCode' => 'INT1301',
                'courseName' => 'Lập trình web',
                'lecturerId' => 21,
                'lecturerName' => 'Nguyễn Văn Hùng',
                'roomName' => '311.H1',
                'dayOfWeek' => 2,
                'startPeriod' => 1,
                'endPeriod' => 3,
                'studyStartAt' => '2026-06-08 08:00:00',
                'studyEndAt' => '2026-06-28 17:00:00',
            ])
            ->assertJsonMissing([
                'classId' => $cancelledRegistrationClass->id,
            ])
            ->assertJsonMissing([
                'classId' => $unregisteredClass->id,
            ])
            ->assertJsonMissing([
                'classId' => $draftPeriodClass->id,
            ]);
    }

    private function createUser(string $username, UserRole $role, array $overrides = []): User
    {
        return User::create(array_merge([
            'username' => $username,
            'password_hash' => 'password123',
            'role' => $role,
        ], $overrides));
    }

    private function createTutorialPeriod(TutorialPeriodStatus $status, string $title): TutorialPeriod
    {
        return TutorialPeriod::create([
            'academic_period_id' => 296,
            'title' => $title,
            'description' => $title . ' description',
            'registration_start_at' => '2026-06-01 08:00:00',
            'registration_end_at' => '2026-06-05 17:00:00',
            'study_start_at' => '2026-06-08 08:00:00',
            'study_end_at' => '2026-06-28 17:00:00',
            'status' => $status,
            'created_by' => $this->createUser('admin_' . $title, UserRole::ADMIN)->id,
        ]);
    }

    private function createRegistration(
        int $tutorialPeriodId,
        int $userId,
        string $courseCode,
        string $courseName,
        int $credits,
        TutorialRegistrationStatus $status
    ): TutorialRegistration {
        return TutorialRegistration::create([
            'tutorial_period_id' => $tutorialPeriodId,
            'user_id' => $userId,
            'course_code' => $courseCode,
            'course_name' => $courseName,
            'credits' => $credits,
            'status' => $status,
            'registered_at' => '2026-06-03 09:00:00',
            'cancelled_at' => $status === TutorialRegistrationStatus::CANCELLED
                ? '2026-06-03 10:00:00'
                : null,
        ]);
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createTutorialClass(
        int $tutorialPeriodId,
        string $courseCode,
        string $courseName,
        array $overrides = []
    ): TutorialClass {
        return TutorialClass::create(array_merge([
            'tutorial_period_id' => $tutorialPeriodId,
            'course_code' => $courseCode,
            'course_name' => $courseName,
            'credits' => 2,
            'total_sessions' => 5,
            'periods_per_session' => 3,
            'total_periods' => 15,
            'status' => TutorialClassStatus::PLANNED,
            'created_by' => $this->createUser(
                'department_' . $courseCode . '_' . $tutorialPeriodId,
                UserRole::DEPARTMENT
            )->id,
        ], $overrides));
    }

    private function createSchedule(
        int $tutorialClassId,
        int $dayOfWeek,
        int $startPeriod,
        int $endPeriod,
        string $roomName
    ): TutorialClassSchedule {
        return TutorialClassSchedule::create([
            'tutorial_class_id' => $tutorialClassId,
            'room_id' => 1,
            'room_code' => $roomName,
            'room_name' => $roomName,
            'room_capacity' => 60,
            'day_of_week' => $dayOfWeek,
            'start_period' => $startPeriod,
            'end_period' => $endPeriod,
        ]);
    }
}
