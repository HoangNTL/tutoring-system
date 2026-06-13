<?php

namespace App\Services\TutorialPeriods;

use App\Contracts\Legacy\LegacyApiClient;
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
        private LegacyApiClient $legacyApiService
    ) {}

    /**
     * @return array<int, array{courseCode:string,courseName:string,credits:int}>
     */
    public function getAvailableCourses(User $user, int $tutorialPeriodId): array
    {
        if ($user->role !== UserRole::STUDENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $tutorialPeriod = $this->findTutorialPeriodOrFail($tutorialPeriodId);
        $this->ensureOpenStatus($tutorialPeriod);
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

    private function findTutorialPeriodOrFail(int $tutorialPeriodId): TutorialPeriod
    {
        try {
            return TutorialPeriod::query()
                ->whereKey($tutorialPeriodId)
                ->firstOrFail();
        } catch (ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }

    private function ensureOpenStatus(TutorialPeriod $tutorialPeriod): void
    {
        if ($tutorialPeriod->status !== TutorialPeriodStatus::OPEN) {
            throw new NotFoundHttpException('Tutorial period not found');
        }
    }
}
