<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialRegistrationStatus;
use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StudentTutorialRegistrationService
{
    public function __construct(
        private StudentTutorialPeriodCourseService $studentTutorialPeriodCourseService
    ) {}

    public function register(User $user, int $tutorialPeriodId, string $courseCode): TutorialRegistration
    {
        $this->ensureStudent($user);
        $tutorialPeriod = $this->findOpenTutorialPeriodOrFail($tutorialPeriodId, 'register');
        $normalizedCourseCode = trim($courseCode);

        if ($normalizedCourseCode === '') {
            throw new UnprocessableEntityHttpException('Mã môn học không hợp lệ.');
        }

        $availableCourse = collect(
            $this->studentTutorialPeriodCourseService->getAvailableCourses($user, $tutorialPeriodId)
        )->firstWhere('courseCode', $normalizedCourseCode);

        if ($availableCourse === null) {
            throw new UnprocessableEntityHttpException('Môn học này không có trong danh sách có thể đăng ký.');
        }

        return DB::transaction(function () use ($tutorialPeriod, $user, $normalizedCourseCode, $availableCourse) {
            $registration = TutorialRegistration::query()
                ->where('tutorial_period_id', $tutorialPeriod->id)
                ->where('user_id', $user->id)
                ->where('course_code', $normalizedCourseCode)
                ->first();

            if ($registration === null) {
                return TutorialRegistration::create([
                    'tutorial_period_id' => $tutorialPeriod->id,
                    'user_id' => $user->id,
                    'department_id' => $availableCourse['departmentId'],
                    'course_code' => $availableCourse['courseCode'],
                    'course_name' => $availableCourse['courseName'],
                    'credits' => (int) $availableCourse['credits'],
                    'status' => TutorialRegistrationStatus::REGISTERED,
                    'registered_at' => now(),
                    'cancelled_at' => null,
                ]);
            }

            if ($registration->status === TutorialRegistrationStatus::REGISTERED) {
                throw new ConflictHttpException('Bạn đã đăng ký môn học này rồi.');
            }

            $registration->forceFill([
                'department_id' => $availableCourse['departmentId'],
                'course_name' => $availableCourse['courseName'],
                'credits' => (int) $availableCourse['credits'],
                'status' => TutorialRegistrationStatus::REGISTERED,
                'registered_at' => now(),
                'cancelled_at' => null,
            ])->save();

            return $registration->refresh();
        });
    }

    public function cancel(User $user, int $tutorialPeriodId, string $courseCode): TutorialRegistration
    {
        $this->ensureStudent($user);
        $this->findOpenTutorialPeriodOrFail($tutorialPeriodId, 'cancel');
        $normalizedCourseCode = trim($courseCode);

        if ($normalizedCourseCode === '') {
            throw new UnprocessableEntityHttpException('Mã môn học không hợp lệ.');
        }

        $registration = TutorialRegistration::query()
            ->where('tutorial_period_id', $tutorialPeriodId)
            ->where('user_id', $user->id)
            ->where('course_code', $normalizedCourseCode)
            ->first();

        if ($registration === null) {
            throw new NotFoundHttpException('Không tìm thấy đăng ký môn học.');
        }

        if ($registration->status === TutorialRegistrationStatus::CANCELLED) {
            throw new UnprocessableEntityHttpException('Đăng ký môn học này đã được hủy trước đó.');
        }

        $registration->forceFill([
            'status' => TutorialRegistrationStatus::CANCELLED,
            'cancelled_at' => now(),
        ])->save();

        return $registration->refresh();
    }

    private function ensureStudent(User $user): void
    {
        if ($user->role !== UserRole::STUDENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }
    }

    private function findOpenTutorialPeriodOrFail(int $tutorialPeriodId, string $action = 'register'): TutorialPeriod
    {
        $tutorialPeriod = TutorialPeriod::query()->find($tutorialPeriodId);

        if ($tutorialPeriod === null) {
            throw new NotFoundHttpException('Tutorial period not found');
        }

        if ($tutorialPeriod->status !== TutorialPeriodStatus::OPEN) {
            if ($tutorialPeriod->status === TutorialPeriodStatus::ASSIGNING) {
                $message = $action === 'cancel'
                    ? 'Bạn không thể hủy đăng ký, lí do là hết thời gian đăng ký rồi và đang trong thời gian phân công.'
                    : 'Bạn không thể đăng ký, lí do là hết thời gian đăng ký rồi và đang trong thời gian phân công.';
                throw new UnprocessableEntityHttpException($message);
            }
            $message = $action === 'cancel'
                ? 'Đợt học phụ đạo hiện không mở để hủy đăng ký.'
                : 'Bạn không thể đăng ký, đợt học phụ đạo hiện không mở đăng ký.';
            throw new UnprocessableEntityHttpException($message);
        }

        return $tutorialPeriod;
    }
}
