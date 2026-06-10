<?php

namespace App\Services\TutorialPeriods;

use App\Enums\TutorialPeriodStatus;
use App\Models\TutorialPeriod;
use App\Models\User;
use App\Enums\TutorialClassStatus;
use App\Enums\TutorialRegistrationStatus;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class StudentTutorialPeriodService
{
    public function __construct(
        private TutorialPeriodAcademicPeriodResolver $academicPeriodResolver
    ) {}

    /**
     * @return Collection<int, TutorialPeriod>
     */
    public function getVisibleTutorialPeriods(User $user): Collection
    {
        $tutorialPeriods = TutorialPeriod::query()
            ->whereIn('status', array_map(
                static fn (TutorialPeriodStatus $status): string => $status->value,
                $this->visibleStatuses()
            ))
            ->orderByDesc('registration_start_at')
            ->get();

        $this->academicPeriodResolver->enrichCollection($tutorialPeriods);
        $this->attachPermissions($tutorialPeriods, $user);

        return $tutorialPeriods;
    }

    /**
     * @return list<TutorialPeriodStatus>
     */
    private function visibleStatuses(): array
    {
        return [
            TutorialPeriodStatus::OPEN,
            TutorialPeriodStatus::ASSIGNING,
            TutorialPeriodStatus::ONGOING,
            TutorialPeriodStatus::CLOSED,
        ];
    }

    /**
     * @param  Collection<int, TutorialPeriod>  $tutorialPeriods
     */
    private function attachPermissions(Collection $tutorialPeriods, User $user): void
    {
        $scheduleVisiblePeriodIds = $this->scheduleVisiblePeriodIds($tutorialPeriods, $user);

        $tutorialPeriods->each(function (TutorialPeriod $tutorialPeriod) use ($scheduleVisiblePeriodIds): void {
            $status = $tutorialPeriod->status;
            $canRegister = $status === TutorialPeriodStatus::OPEN;
            $canViewSchedule = in_array($status, [
                TutorialPeriodStatus::ASSIGNING,
                TutorialPeriodStatus::ONGOING,
                TutorialPeriodStatus::CLOSED,
            ], true) && $scheduleVisiblePeriodIds->contains($tutorialPeriod->id);

            $tutorialPeriod->setAttribute('student_permissions', [
                'canViewRegistrationInfo' => in_array($status, $this->visibleStatuses(), true),
                'canRegister' => $canRegister,
                'canCancelRegistration' => $canRegister,
                'canViewSchedule' => $canViewSchedule,
            ]);
        });
    }

    /**
     * @param  Collection<int, TutorialPeriod>  $tutorialPeriods
     * @return SupportCollection<int, int>
     */
    private function scheduleVisiblePeriodIds(Collection $tutorialPeriods, User $user): SupportCollection
    {
        $periodIds = $tutorialPeriods->pluck('id')->all();

        if ($periodIds === []) {
            return collect();
        }

        return \App\Models\TutorialClassSchedule::query()
            ->selectRaw('distinct tutorial_classes.tutorial_period_id')
            ->join(
                'tutorial_classes',
                'tutorial_classes.id',
                '=',
                'tutorial_class_schedules.tutorial_class_id'
            )
            ->join(
                'tutorial_registrations',
                function ($join) use ($user): void {
                    $join
                        ->on('tutorial_registrations.tutorial_period_id', '=', 'tutorial_classes.tutorial_period_id')
                        ->on('tutorial_registrations.course_code', '=', 'tutorial_classes.course_code')
                        ->where('tutorial_registrations.user_id', '=', $user->id)
                        ->where('tutorial_registrations.status', '=', TutorialRegistrationStatus::REGISTERED->value);
                }
            )
            ->whereIn('tutorial_classes.tutorial_period_id', $periodIds)
            ->where('tutorial_classes.status', TutorialClassStatus::SCHEDULED->value)
            ->pluck('tutorial_classes.tutorial_period_id');
    }
}
