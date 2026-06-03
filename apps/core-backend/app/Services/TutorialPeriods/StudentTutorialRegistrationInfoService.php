<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\User;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class StudentTutorialRegistrationInfoService
{
    public function __construct(
        private StudentTutorialPeriodCourseService $studentTutorialPeriodCourseService,
        private TutorialPeriodAcademicPeriodResolver $academicPeriodResolver
    ) {}

    /**
     * @return array{
     *   tutorialPeriod: TutorialPeriod,
     *   availableCourses: array<int, array{courseCode:string,courseName:string,credits:int}>,
     *   registeredCourses: array<int, array{courseCode:string,courseName:string,credits:int}>
     * }
     */
    public function getRegistrationInfo(User $user, int $tutorialPeriodId): array
    {
        if ($user->role !== UserRole::STUDENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $tutorialPeriod = $this->findOpenTutorialPeriodOrFail($tutorialPeriodId);

        if ($tutorialPeriod->academic_period_id === null) {
            throw new UnprocessableEntityHttpException(
                'Tutorial period is not configured with a legacy academic period.'
            );
        }

        $this->academicPeriodResolver->enrich($tutorialPeriod);

        $availableCourses = $this->studentTutorialPeriodCourseService->getAvailableCourses(
            $user,
            $tutorialPeriodId
        );

        // TODO: verify the persistence model for registered tutorial courses before loading local data.
        $registeredCourses = [];

        return [
            'tutorialPeriod' => $tutorialPeriod,
            'availableCourses' => $availableCourses,
            'registeredCourses' => $registeredCourses,
        ];
    }

    private function findOpenTutorialPeriodOrFail(int $tutorialPeriodId): TutorialPeriod
    {
        try {
            return TutorialPeriod::query()
                ->whereKey($tutorialPeriodId)
                ->where('status', TutorialPeriodStatus::OPEN)
                ->firstOrFail();
        } catch (ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }
}
