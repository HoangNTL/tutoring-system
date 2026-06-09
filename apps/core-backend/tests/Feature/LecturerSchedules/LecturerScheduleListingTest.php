<?php

namespace Tests\Feature\LecturerSchedules;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialClass;
use App\Models\TutorialClassSchedule;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LecturerScheduleListingTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_is_blocked(): void
    {
        $this->getJson('/api/v1/lecturer/schedules')->assertUnauthorized();
    }

    public function test_non_lecturer_user_is_blocked(): void
    {
        $student = $this->createUser('student_schedule_blocked', UserRole::STUDENT);

        $this->actingAs($student, 'web')
            ->getJson('/api/v1/lecturer/schedules')
            ->assertForbidden();
    }

    public function test_lecturer_without_lecturer_id_receives_bad_request(): void
    {
        $lecturer = $this->createUser('lecturer_missing_mapping', UserRole::LECTURER);

        $this->actingAs($lecturer, 'web')
            ->getJson('/api/v1/lecturer/schedules')
            ->assertBadRequest()
            ->assertJsonPath('message', 'Không xác định được giảng viên của tài khoản hiện tại.');
    }

    public function test_lecturer_can_list_only_own_scheduled_classes(): void
    {
        $lecturer = $this->createUser('lecturer_schedule_owner', UserRole::LECTURER, [
            'lecturer_id' => 31,
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Đợt xếp lịch');
        $closedPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::CLOSED, 'Đợt đã đóng');
        $draftPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::DRAFT, 'Đợt nháp');

        $ownedClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            'INT2301',
            'Cơ sở dữ liệu',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 31,
                'lecturer_name' => 'Trần Văn A',
            ]
        );
        $otherLecturerClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            'INT2302',
            'Hệ điều hành',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 32,
                'lecturer_name' => 'Lê Thị B',
            ]
        );
        $assignedButUnsheduledClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            'INT2303',
            'Trí tuệ nhân tạo',
            [
                'status' => TutorialClassStatus::ASSIGNED,
                'lecturer_id' => 31,
                'lecturer_name' => 'Trần Văn A',
            ]
        );
        $closedPeriodClass = $this->createTutorialClass(
            $closedPeriod->id,
            'INT2304',
            'Mật mã học',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 31,
                'lecturer_name' => 'Trần Văn A',
            ]
        );
        $draftPeriodClass = $this->createTutorialClass(
            $draftPeriod->id,
            'INT2305',
            'Đồ họa máy tính',
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 31,
                'lecturer_name' => 'Trần Văn A',
            ]
        );

        $ownedSchedule = $this->createSchedule($ownedClass->id, 2, 1, 3, '501.H2');
        $closedSchedule = $this->createSchedule($closedPeriodClass->id, 4, 4, 6, '502.H2');
        $this->createSchedule($otherLecturerClass->id, 3, 7, 9, '503.H2');
        $this->createSchedule($assignedButUnsheduledClass->id, 5, 10, 12, '504.H2');
        $this->createSchedule($draftPeriodClass->id, 6, 13, 15, '505.H2');

        $this->actingAs($lecturer, 'web')
            ->getJson('/api/v1/lecturer/schedules')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment([
                'id' => $ownedSchedule->id,
                'classId' => $ownedClass->id,
                'tutorialPeriodId' => $tutorialPeriod->id,
                'courseCode' => 'INT2301',
                'courseName' => 'Cơ sở dữ liệu',
                'lecturerId' => 31,
                'lecturerName' => 'Trần Văn A',
                'roomName' => '501.H2',
                'dayOfWeek' => 2,
                'startPeriod' => 1,
                'endPeriod' => 3,
            ])
            ->assertJsonFragment([
                'id' => $closedSchedule->id,
                'classId' => $closedPeriodClass->id,
                'tutorialPeriodId' => $closedPeriod->id,
                'courseCode' => 'INT2304',
                'courseName' => 'Mật mã học',
                'lecturerId' => 31,
                'lecturerName' => 'Trần Văn A',
                'roomName' => '502.H2',
                'dayOfWeek' => 4,
                'startPeriod' => 4,
                'endPeriod' => 6,
            ])
            ->assertJsonMissing([
                'classId' => $otherLecturerClass->id,
            ])
            ->assertJsonMissing([
                'classId' => $assignedButUnsheduledClass->id,
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
