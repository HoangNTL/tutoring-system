<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\UserRole;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
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
     *   registeredCourses: array<int, array{courseCode:string,courseName:string,credits:int,registeredAt:?string}>
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

        $availableCourses = [];
        if ($tutorialPeriod->status === TutorialPeriodStatus::OPEN) {
            $availableCourses = $this->studentTutorialPeriodCourseService->getAvailableCourses(
                $user,
                $tutorialPeriodId
            );
        }

        $classes = \App\Models\TutorialClass::query()
            ->with('schedules')
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->get()
            ->keyBy('course_code');

        $registeredCourses = TutorialRegistration::query()
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->where('user_id', $user->id)
            ->where('status', TutorialRegistrationStatus::REGISTERED)
            ->orderBy('course_name')
            ->get()
            ->map(static function (TutorialRegistration $registration) use ($classes): array {
                $class = $classes->get($registration->course_code);
                $firstSchedule = $class?->schedules?->first();

                return [
                    'courseCode' => $registration->course_code,
                    'courseName' => $registration->course_name,
                    'credits' => $registration->credits,
                    'registeredAt' => $registration->registered_at?->format('Y-m-d H:i:s'),
                    'dayOfWeek' => $firstSchedule?->day_of_week,
                    'startPeriod' => $firstSchedule?->start_period,
                    'room' => $firstSchedule?->room,
                    'lecturerId' => $class?->lecturer_id,
                    'lecturerName' => $class?->lecturer_name,
                    'classStatus' => $class?->status?->name,
                    'schedules' => $class?->schedules?->map(fn($s) => [
                        'dayOfWeek' => $s->day_of_week,
                        'startPeriod' => $s->start_period,
                        'room' => $s->room,
                    ])->all() ?? [],
                ];
            })
            ->values()
            ->all();

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
                ->whereIn('status', [
                    TutorialPeriodStatus::OPEN->value,
                    TutorialPeriodStatus::ASSIGNING->value,
                    TutorialPeriodStatus::ONGOING->value,
                    TutorialPeriodStatus::CLOSED->value,
                ])
                ->firstOrFail();
        } catch (ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }
}
