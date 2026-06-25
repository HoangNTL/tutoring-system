<?php

namespace App\Services\TutorialPeriods;

use App\Contracts\LegacyDataGateway;
use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StudentTutorialPeriodCourseService
{
    public function __construct(
        private LegacyDataGateway $legacyDataGateway
    ) {}

    /**
     * @return array<int, array{courseCode:string,courseName:string,credits:int}>
     */
    public function getAvailableCourses(User $user, int $tutorialPeriodId): array
    {
        if ($user->role !== UserRole::STUDENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $tutorialPeriod = $this->findOpenTutorialPeriodOrFail($tutorialPeriodId);
        $legacyPeriodId = $tutorialPeriod->academic_period_id;

        if ($legacyPeriodId === null) {
            throw new UnprocessableEntityHttpException(
                'Tutorial period is not configured with a legacy academic period.'
            );
        }

        if ($user->student_id !== null) {
            return $this->legacyDataGateway->fetchStudentCoursesByLegacyStudentId(
                (int) $user->student_id,
                (int) $legacyPeriodId
            );
        }

        $studentCode = trim((string) $user->username);

        if ($studentCode === '') {
            throw new UnprocessableEntityHttpException(
                'Student account is missing a usable identifier.'
            );
        }

        return $this->legacyDataGateway->fetchStudentCoursesByStudentCode(
            $studentCode,
            (int) $legacyPeriodId
        );
    }

    private function findOpenTutorialPeriodOrFail(int $tutorialPeriodId): TutorialPeriod
    {
        $tutorialPeriod = TutorialPeriod::query()->find($tutorialPeriodId);

        if ($tutorialPeriod === null) {
            throw new NotFoundHttpException('Tutorial period not found');
        }

        if ($tutorialPeriod->status !== TutorialPeriodStatus::OPEN) {
            if ($tutorialPeriod->status === TutorialPeriodStatus::ASSIGNING) {
                throw new UnprocessableEntityHttpException(
                    'Bạn không thể lấy danh sách môn học, lí do là hết thời gian đăng ký rồi và đang trong thời gian phân công.'
                );
            }
            throw new UnprocessableEntityHttpException('Đợt học phụ đạo hiện không mở đăng ký.');
        }

        return $tutorialPeriod;
    }
}
