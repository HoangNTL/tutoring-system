<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Enums\TutorialClassStatus;
use App\Enums\UserRole;
use App\Models\TutorialClassSchedule;
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
     *   registeredCourses: array<int, array{courseCode:string,courseName:string,credits:int,registeredAt:?string}>,
     *   permissions: array{
     *     canViewRegistrationInfo: bool,
     *     canRegister: bool,
     *     canCancelRegistration: bool,
     *     canViewSchedule: bool
     *   }
     * }
     */
    public function getRegistrationInfo(User $user, int $tutorialPeriodId): array
    {
        if ($user->role !== UserRole::STUDENT) {
            throw new AccessDeniedHttpException('This action is unauthorized.');
        }

        $tutorialPeriod = $this->findViewableTutorialPeriodOrFail($tutorialPeriodId);
        $permissions = $this->buildPermissions($tutorialPeriod, $user);

        $this->academicPeriodResolver->enrich($tutorialPeriod);

        $availableCourses = $permissions['canRegister']
            ? $this->getAvailableCourses($user, $tutorialPeriodId, $tutorialPeriod)
            : [];

        $registeredCourses = TutorialRegistration::query()
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->where('user_id', $user->id)
            ->where('status', TutorialRegistrationStatus::REGISTERED)
            ->orderBy('course_name')
            ->get()
            ->map(static fn (TutorialRegistration $registration): array => [
                'courseCode' => $registration->course_code,
                'courseName' => $registration->course_name,
                'credits' => $registration->credits,
                'registeredAt' => $registration->registered_at?->format('Y-m-d H:i:s'),
            ])
            ->values()
            ->all();

        return [
            'tutorialPeriod' => $tutorialPeriod,
            'availableCourses' => $availableCourses,
            'registeredCourses' => $registeredCourses,
            'permissions' => $permissions,
        ];
    }

    private function findViewableTutorialPeriodOrFail(int $tutorialPeriodId): TutorialPeriod
    {
        try {
            return TutorialPeriod::query()
                ->whereKey($tutorialPeriodId)
                ->whereNotIn('status', [
                    TutorialPeriodStatus::DRAFT->value,
                    TutorialPeriodStatus::CANCELLED->value,
                ])
                ->firstOrFail();
        } catch (ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }

    /**
     * @return array{canViewRegistrationInfo:bool,canRegister:bool,canCancelRegistration:bool,canViewSchedule:bool}
     */
    private function buildPermissions(TutorialPeriod $tutorialPeriod, User $user): array
    {
        $canRegister = $tutorialPeriod->status === TutorialPeriodStatus::OPEN;

        return [
            'canViewRegistrationInfo' => true,
            'canRegister' => $canRegister,
            'canCancelRegistration' => $canRegister,
            'canViewSchedule' => $this->canViewSchedule($tutorialPeriod, $user),
        ];
    }

    /**
     * @return array<int, array{courseCode:string,courseName:string,credits:int}>
     */
    private function getAvailableCourses(User $user, int $tutorialPeriodId, TutorialPeriod $tutorialPeriod): array
    {
        if ($tutorialPeriod->academic_period_id === null) {
            throw new UnprocessableEntityHttpException(
                'Tutorial period is not configured with a legacy academic period.'
            );
        }

        return $this->studentTutorialPeriodCourseService->getAvailableCourses(
            $user,
            $tutorialPeriodId
        );
    }

    private function canViewSchedule(TutorialPeriod $tutorialPeriod, User $user): bool
    {
        if (!in_array($tutorialPeriod->status, [
            TutorialPeriodStatus::ASSIGNING,
            TutorialPeriodStatus::ONGOING,
            TutorialPeriodStatus::CLOSED,
        ], true)) {
            return false;
        }

        return TutorialClassSchedule::query()
            ->join(
                'tutorial_classes',
                'tutorial_classes.id',
                '=',
                'tutorial_class_schedules.tutorial_class_id'
            )
            ->join(
                'tutorial_registrations',
                function ($join) use ($user, $tutorialPeriod): void {
                    $join
                        ->on('tutorial_registrations.tutorial_period_id', '=', 'tutorial_classes.tutorial_period_id')
                        ->on('tutorial_registrations.course_code', '=', 'tutorial_classes.course_code')
                        ->where('tutorial_registrations.user_id', '=', $user->id)
                        ->where('tutorial_registrations.status', '=', TutorialRegistrationStatus::REGISTERED->value)
                        ->where('tutorial_registrations.tutorial_period_id', '=', $tutorialPeriod->id);
                }
            )
            ->where('tutorial_classes.tutorial_period_id', $tutorialPeriod->id)
            ->where('tutorial_classes.status', TutorialClassStatus::SCHEDULED->value)
            ->exists();
    }
}
