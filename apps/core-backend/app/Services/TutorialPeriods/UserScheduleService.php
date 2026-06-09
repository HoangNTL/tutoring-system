<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialClassStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialClassSchedule;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class UserScheduleService
{
    /**
     * @return Collection<int, TutorialClassSchedule>
     */
    public function getStudentSchedules(User $user): Collection
    {
        $this->ensureRole($user, UserRole::STUDENT);

        return $this->baseScheduleQuery()
            ->whereExists(function ($query) use ($user): void {
                $query
                    ->selectRaw('1')
                    ->from('tutorial_registrations')
                    ->whereColumn(
                        'tutorial_registrations.tutorial_period_id',
                        'tutorial_classes.tutorial_period_id'
                    )
                    ->whereColumn(
                        'tutorial_registrations.course_code',
                        'tutorial_classes.course_code'
                    )
                    ->where('tutorial_registrations.user_id', $user->id)
                    ->where(
                        'tutorial_registrations.status',
                        TutorialRegistrationStatus::REGISTERED->value
                    );
            })
            ->get();
    }

    /**
     * @return Collection<int, TutorialClassSchedule>
     */
    public function getLecturerSchedules(User $user): Collection
    {
        $this->ensureRole($user, UserRole::LECTURER);

        if ($user->lecturer_id === null) {
            throw new BadRequestHttpException('Không xác định được giảng viên của tài khoản hiện tại.');
        }

        return $this->baseScheduleQuery()
            ->where('tutorial_classes.lecturer_id', $user->lecturer_id)
            ->get();
    }

    private function ensureRole(User $user, UserRole $role): void
    {
        if ($user->role !== $role) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }
    }

    private function baseScheduleQuery(): Builder
    {
        return TutorialClassSchedule::query()
            ->select('tutorial_class_schedules.*')
            ->join(
                'tutorial_classes',
                'tutorial_classes.id',
                '=',
                'tutorial_class_schedules.tutorial_class_id'
            )
            ->join(
                'tutorial_periods',
                'tutorial_periods.id',
                '=',
                'tutorial_classes.tutorial_period_id'
            )
            ->with(['tutorialClass.tutorialPeriod'])
            ->where('tutorial_classes.status', TutorialClassStatus::SCHEDULED->value)
            ->whereIn('tutorial_periods.status', [
                TutorialPeriodStatus::ASSIGNING->value,
                TutorialPeriodStatus::ONGOING->value,
                TutorialPeriodStatus::CLOSED->value,
            ])
            ->orderBy('tutorial_periods.study_start_at')
            ->orderBy('tutorial_class_schedules.day_of_week')
            ->orderBy('tutorial_class_schedules.start_period')
            ->orderBy('tutorial_class_schedules.room_code');
    }
}
