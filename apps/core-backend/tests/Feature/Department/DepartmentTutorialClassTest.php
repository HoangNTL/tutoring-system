<?php

namespace Tests\Feature\Department;

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
use Illuminate\Support\Facades\Http;
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

    public function test_department_can_list_classes_with_schedule_summary_and_computed_student_count(): void
    {
        $department = $this->createUser('department_list_classes', UserRole::DEPARTMENT);
        $studentA = $this->createUser('student_list_a', UserRole::STUDENT);
        $studentB = $this->createUser('student_list_b', UserRole::STUDENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');

        $this->createRegistration($tutorialPeriod->id, $studentA->id, '020205', 'An toàn lao động', 2);
        $this->createRegistration($tutorialPeriod->id, $studentB->id, '020205', 'An toàn lao động', 2);

        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->createTutorialClassSchedule($tutorialClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);

        $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/classes")
            ->assertOk()
            ->assertJsonPath('data.0.courseCode', '020205')
            ->assertJsonPath('data.0.studentCount', 2)
            ->assertJsonPath('data.0.scheduleCount', 1)
            ->assertJsonPath('data.0.schedulePreview.dayOfWeek', 2)
            ->assertJsonMissingPath('data.0.roomId')
            ->assertJsonMissingPath('data.0.dayOfWeek');
    }

    public function test_department_can_list_room_options(): void
    {
        $department = $this->createUser('department_rooms', UserRole::DEPARTMENT);
        $this->fakeLegacyDirectory();

        $this->actingAs($department, 'web')
            ->getJson('/api/v1/department/rooms')
            ->assertOk()
            ->assertJsonPath('data.0.id', 1)
            ->assertJsonPath('data.0.code', '313.H1')
            ->assertJsonPath('data.0.capacity', 60);
    }

    public function test_department_can_list_lecturer_options(): void
    {
        $department = $this->createUser('department_lecturers', UserRole::DEPARTMENT, [
            'department_id' => 10,
        ]);
        $this->fakeLegacyDirectory();

        $this->actingAs($department, 'web')
            ->getJson('/api/v1/department/lecturers')
            ->assertOk()
            ->assertJsonPath('data.0.id', 1)
            ->assertJsonPath('data.0.code', 'GV001')
            ->assertJsonPath('data.0.fullName', 'Nguyễn Văn A')
            ->assertJsonPath('data.0.departmentName', 'Bộ môn Kết cấu');
    }

    public function test_department_lecturer_options_require_department_id(): void
    {
        $department = $this->createUser('department_lecturers_missing', UserRole::DEPARTMENT);

        $this->actingAs($department, 'web')
            ->getJson('/api/v1/department/lecturers')
            ->assertBadRequest()
            ->assertJsonPath('message', 'Không xác định được bộ môn của tài khoản hiện tại.');
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
            ->assertJsonPath('data.scheduleCount', 0)
            ->assertJsonPath('data.status', TutorialClassStatus::PLANNED->name);
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
            [
                'status' => TutorialClassStatus::CANCELLED,
                'cancelled_at' => '2026-06-04 09:00:00',
            ]
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

    public function test_department_can_assign_lecturer_to_planned_class(): void
    {
        $department = $this->createUser('department_assign_lecturer', UserRole::DEPARTMENT, [
            'department_id' => 10,
        ]);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass($tutorialPeriod->id, '020205', 'An toàn lao động', 5, 3);
        $this->fakeLegacyDirectory();

        $this->actingAs($department, 'web')
            ->patchJson("/api/v1/department/classes/{$tutorialClass->id}/assign-lecturer", [
                'lecturerId' => 1,
            ])
            ->assertOk()
            ->assertJsonPath('data.lecturerId', 1)
            ->assertJsonPath('data.lecturerCode', 'GV001')
            ->assertJsonPath('data.lecturerName', 'Nguyễn Văn A')
            ->assertJsonPath('data.status', TutorialClassStatus::ASSIGNED->name)
            ->assertJsonPath('data.assignedAt', '2026-06-04 00:00:00');
    }

    public function test_department_can_add_and_list_multiple_schedules_for_one_class(): void
    {
        $department = $this->createUser('department_add_schedules', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::ASSIGNED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->fakeLegacyDirectory();

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/classes/{$tutorialClass->id}/schedules", [
                'roomId' => 1,
                'dayOfWeek' => 2,
                'startPeriod' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('data.roomCode', '313.H1')
            ->assertJsonPath('data.endPeriod', 3);

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/classes/{$tutorialClass->id}/schedules", [
                'roomId' => 2,
                'dayOfWeek' => 4,
                'startPeriod' => 4,
            ])
            ->assertCreated()
            ->assertJsonPath('data.roomCode', '314.H1')
            ->assertJsonPath('data.endPeriod', 6);

        $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/classes/{$tutorialClass->id}/schedules")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.dayOfWeek', 2)
            ->assertJsonPath('data.1.dayOfWeek', 4);

        $this->assertDatabaseHas('tutorial_classes', [
            'id' => $tutorialClass->id,
            'status' => TutorialClassStatus::SCHEDULED->value,
        ]);
    }

    public function test_deleting_one_schedule_keeps_class_scheduled_when_other_schedules_exist(): void
    {
        $department = $this->createUser('department_delete_one_schedule', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $scheduleA = $this->createTutorialClassSchedule($tutorialClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);
        $this->createTutorialClassSchedule($tutorialClass->id, 2, '314.H1', '314.H1', 55, 4, 4, 6);

        $this->actingAs($department, 'web')
            ->deleteJson("/api/v1/department/classes/{$tutorialClass->id}/schedules/{$scheduleA->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $scheduleA->id);

        $this->assertDatabaseMissing('tutorial_class_schedules', ['id' => $scheduleA->id]);
        $this->assertDatabaseHas('tutorial_classes', [
            'id' => $tutorialClass->id,
            'status' => TutorialClassStatus::SCHEDULED->value,
        ]);
    }

    public function test_deleting_last_schedule_changes_status_to_assigned(): void
    {
        $department = $this->createUser('department_delete_last_schedule', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $schedule = $this->createTutorialClassSchedule($tutorialClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);

        $this->actingAs($department, 'web')
            ->deleteJson("/api/v1/department/classes/{$tutorialClass->id}/schedules/{$schedule->id}")
            ->assertOk();

        $this->assertDatabaseHas('tutorial_classes', [
            'id' => $tutorialClass->id,
            'status' => TutorialClassStatus::ASSIGNED->value,
        ]);
    }

    public function test_cannot_add_schedule_when_lecturer_has_conflict(): void
    {
        $department = $this->createUser('department_lecturer_conflict', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $existingClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->createTutorialClassSchedule($existingClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);
        $targetClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020206',
            'Bê tông cốt thép',
            5,
            3,
            [
                'status' => TutorialClassStatus::ASSIGNED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->fakeLegacyDirectory();

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/classes/{$targetClass->id}/schedules", [
                'roomId' => 2,
                'dayOfWeek' => 2,
                'startPeriod' => 2,
            ])
            ->assertConflict()
            ->assertJsonPath('message', 'Giảng viên đã có lịch dạy trùng thời gian.');
    }

    public function test_cannot_add_schedule_when_room_has_conflict(): void
    {
        $department = $this->createUser('department_room_conflict', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $existingClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->createTutorialClassSchedule($existingClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);
        $targetClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020206',
            'Bê tông cốt thép',
            5,
            3,
            [
                'status' => TutorialClassStatus::ASSIGNED,
                'lecturer_id' => 2,
                'lecturer_code' => 'GV002',
                'lecturer_name' => 'Trần Thị B',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->fakeLegacyDirectory();

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/classes/{$targetClass->id}/schedules", [
                'roomId' => 1,
                'dayOfWeek' => 2,
                'startPeriod' => 2,
            ])
            ->assertConflict()
            ->assertJsonPath('message', 'Phòng học đã được sử dụng trong thời gian này.');
    }

    public function test_cancelled_class_schedules_are_ignored_in_conflicts(): void
    {
        $department = $this->createUser('department_ignore_cancelled_conflict', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $cancelledClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::CANCELLED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
                'cancelled_at' => '2026-06-04 09:00:00',
            ]
        );
        $this->createTutorialClassSchedule($cancelledClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);
        $targetClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020206',
            'Bê tông cốt thép',
            5,
            3,
            [
                'status' => TutorialClassStatus::ASSIGNED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->fakeLegacyDirectory();

        $this->actingAs($department, 'web')
            ->postJson("/api/v1/department/classes/{$targetClass->id}/schedules", [
                'roomId' => 1,
                'dayOfWeek' => 2,
                'startPeriod' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('data.roomId', 1);
    }

    public function test_department_can_cancel_scheduled_class_and_restore_to_scheduled(): void
    {
        $department = $this->createUser('department_restore_scheduled', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_code' => 'GV001',
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->createTutorialClassSchedule($tutorialClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);

        $this->actingAs($department, 'web')
            ->patchJson("/api/v1/department/classes/{$tutorialClass->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', TutorialClassStatus::CANCELLED->name)
            ->assertJsonPath('data.cancelledAt', '2026-06-04 00:00:00');

        $this->actingAs($department, 'web')
            ->patchJson("/api/v1/department/classes/{$tutorialClass->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.status', TutorialClassStatus::SCHEDULED->name)
            ->assertJsonPath('data.scheduleCount', 1)
            ->assertJsonPath('data.cancelledAt', null);
    }

    public function test_weekly_timetable_returns_schedule_rows(): void
    {
        $department = $this->createUser('department_timetable', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot assign');
        $tutorialClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'An toàn lao động',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_name' => 'Nguyễn Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $this->createTutorialClassSchedule($tutorialClass->id, 1, '313.H1', '313.H1', 60, 2, 1, 3);
        $this->createTutorialClassSchedule($tutorialClass->id, 2, '314.H1', '314.H1', 55, 4, 4, 6);

        $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/weekly-timetable")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.classId', $tutorialClass->id)
            ->assertJsonPath('data.0.lecturerId', 1)
            ->assertJsonPath('data.0.roomCode', '313.H1')
            ->assertJsonPath('data.1.roomCode', '314.H1');
    }

    public function test_weekly_timetable_returns_all_scheduled_classes_in_period_including_same_cell_stacks(): void
    {
        $department = $this->createUser('department_timetable_all_classes', UserRole::DEPARTMENT);
        $tutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot timetable');
        $otherTutorialPeriod = $this->createTutorialPeriod(TutorialPeriodStatus::ASSIGNING, 'Dot other');

        $classA = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020205',
            'Tổ chức thi công',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 1,
                'lecturer_name' => 'Nguyễn Văn Hùng',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $classB = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020206',
            'Nền móng',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 2,
                'lecturer_name' => 'Trần Văn A',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );
        $cancelledClass = $this->createTutorialClass(
            $tutorialPeriod->id,
            '020207',
            'Bê tông cốt thép',
            5,
            3,
            [
                'status' => TutorialClassStatus::CANCELLED,
                'lecturer_id' => 3,
                'lecturer_name' => 'Lê Văn B',
                'assigned_at' => '2026-06-04 00:00:00',
                'cancelled_at' => '2026-06-04 08:00:00',
            ]
        );
        $otherPeriodClass = $this->createTutorialClass(
            $otherTutorialPeriod->id,
            '020208',
            'Thủy lực',
            5,
            3,
            [
                'status' => TutorialClassStatus::SCHEDULED,
                'lecturer_id' => 4,
                'lecturer_name' => 'Phạm Văn C',
                'assigned_at' => '2026-06-04 00:00:00',
            ]
        );

        $scheduleA = $this->createTutorialClassSchedule($classA->id, 1, '311.H1', '311.H1', 60, 2, 1, 3);
        $scheduleB = $this->createTutorialClassSchedule($classB->id, 2, '312.H1', '312.H1', 55, 2, 1, 3);
        $this->createTutorialClassSchedule($cancelledClass->id, 3, '313.H1', '313.H1', 50, 2, 1, 3);
        $this->createTutorialClassSchedule($otherPeriodClass->id, 4, '314.H1', '314.H1', 45, 2, 1, 3);

        $this->actingAs($department, 'web')
            ->getJson("/api/v1/department/tutorial-periods/{$tutorialPeriod->id}/weekly-timetable")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment([
                'id' => $scheduleA->id,
                'classId' => $classA->id,
                'courseCode' => '020205',
                'courseName' => 'Tổ chức thi công',
                'lecturerId' => 1,
                'lecturerName' => 'Nguyễn Văn Hùng',
                'roomName' => '311.H1',
                'dayOfWeek' => 2,
                'startPeriod' => 1,
                'endPeriod' => 3,
            ])
            ->assertJsonFragment([
                'id' => $scheduleB->id,
                'classId' => $classB->id,
                'courseCode' => '020206',
                'courseName' => 'Nền móng',
                'lecturerId' => 2,
                'lecturerName' => 'Trần Văn A',
                'roomName' => '312.H1',
                'dayOfWeek' => 2,
                'startPeriod' => 1,
                'endPeriod' => 3,
            ])
            ->assertJsonMissing([
                'classId' => $cancelledClass->id,
            ])
            ->assertJsonMissing([
                'classId' => $otherPeriodClass->id,
            ]);
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

    private function fakeLegacyDirectory(): void
    {
        Http::fake([
            '*' => function ($request) {
                $url = $request->url();

                if (str_contains($url, '/legacy/departments/10/lecturers')) {
                    return Http::response([
                        'success' => true,
                        'data' => [
                            [
                                'id' => 1,
                                'code' => 'GV001',
                                'fullName' => 'Nguyễn Văn A',
                                'departmentName' => 'Bộ môn Kết cấu',
                            ],
                            [
                                'id' => 2,
                                'code' => 'GV002',
                                'fullName' => 'Trần Thị B',
                                'departmentName' => 'Bộ môn Kết cấu',
                            ],
                        ],
                    ], 200);
                }

                if (str_contains($url, '/legacy/rooms')) {
                    return Http::response([
                        'success' => true,
                        'data' => [
                            [
                                'id' => 1,
                                'code' => '313.H1',
                                'name' => '313.H1',
                                'capacity' => 60,
                            ],
                            [
                                'id' => 2,
                                'code' => '314.H1',
                                'name' => '314.H1',
                                'capacity' => 55,
                            ],
                        ],
                    ], 200);
                }

                return Http::response([
                    'success' => false,
                    'message' => 'Not found',
                ], 404);
            },
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

    /**
     * @param array<string, mixed> $overrides
     */
    private function createTutorialClass(
        int $tutorialPeriodId,
        string $courseCode,
        string $courseName,
        int $totalSessions,
        int $periodsPerSession,
        array $overrides = []
    ): TutorialClass {
        return TutorialClass::create(array_merge([
            'tutorial_period_id' => $tutorialPeriodId,
            'course_code' => $courseCode,
            'course_name' => $courseName,
            'credits' => 2,
            'total_sessions' => $totalSessions,
            'periods_per_session' => $periodsPerSession,
            'total_periods' => $totalSessions * $periodsPerSession,
            'status' => TutorialClassStatus::PLANNED,
            'created_by' => $this->createUser('creator_' . $courseCode . '_' . $tutorialPeriodId, UserRole::DEPARTMENT)->id,
        ], $overrides));
    }

    private function createTutorialClassSchedule(
        int $tutorialClassId,
        int $roomId,
        string $roomCode,
        string $roomName,
        ?int $roomCapacity,
        int $dayOfWeek,
        int $startPeriod,
        int $endPeriod
    ): TutorialClassSchedule {
        return TutorialClassSchedule::create([
            'tutorial_class_id' => $tutorialClassId,
            'room_id' => $roomId,
            'room_code' => $roomCode,
            'room_name' => $roomName,
            'room_capacity' => $roomCapacity,
            'day_of_week' => $dayOfWeek,
            'start_period' => $startPeriod,
            'end_period' => $endPeriod,
        ]);
    }
}
