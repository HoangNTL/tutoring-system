<?php

namespace App\Services\TutorialPeriods;

use App\Contracts\Legacy\LegacyApiClient;
use App\Enums\TutorialPeriodStatus;
use App\Enums\TutorialRegistrationStatus;
use App\Models\TutorialPeriod;
use App\Models\TutorialRegistration;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Throwable;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class DepartmentTutorialRegistrationService
{
    public function __construct(
        private TutorialPeriodAcademicPeriodResolver $academicPeriodResolver,
        private LegacyApiClient $legacyApiService
    ) {}

    /**
     * @return Collection<int, TutorialPeriod>
     */
    public function getTutorialPeriods(): Collection
    {
        $tutorialPeriods = TutorialPeriod::query()
            ->whereIn('status', $this->allowedStatuses())
            ->orderByDesc('study_start_at')
            ->orderByDesc('id')
            ->get();

        $this->academicPeriodResolver->enrichCollection($tutorialPeriods);

        return $tutorialPeriods;
    }

    public function getCourseRegistrationSummary(int $tutorialPeriodId): array
    {
        $tutorialPeriod = $this->findAccessibleTutorialPeriodOrFail($tutorialPeriodId);

        return TutorialRegistration::query()
            ->selectRaw('course_code as courseCode, course_name as courseName, credits, COUNT(*) as studentCount')
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->where('status', TutorialRegistrationStatus::REGISTERED->value)
            ->groupBy('course_code', 'course_name', 'credits')
            ->orderByDesc('studentCount')
            ->orderBy('course_name')
            ->get()
            ->all();
    }

    /**
     * @return array<int, array{id:int|null,studentCode:string,fullName:string|null,registeredAt:string|null}>
     */
    public function getRegisteredStudents(int $tutorialPeriodId, string $courseCode): array
    {
        $tutorialPeriod = $this->findAccessibleTutorialPeriodOrFail($tutorialPeriodId);

        $registrations = TutorialRegistration::query()
            ->with(['user:id,username,student_id'])
            ->where('tutorial_period_id', $tutorialPeriod->id)
            ->where('course_code', $courseCode)
            ->where('status', TutorialRegistrationStatus::REGISTERED->value)
            ->orderBy('registered_at')
            ->get();

        $legacyStudentInfoById = [];
        $legacyStudentInfoByCode = [];

        return $registrations
            ->map(function (TutorialRegistration $registration) use (&$legacyStudentInfoById, &$legacyStudentInfoByCode): array {
                $username = (string) ($registration->user?->username ?? '');
                $studentId = $registration->user?->student_id;
                $legacyStudent = null;

                if ($studentId !== null) {
                    if (!array_key_exists($studentId, $legacyStudentInfoById)) {
                        $legacyStudentInfoById[$studentId] = $this->fetchLegacyStudentInfoById((int) $studentId);
                    }

                    $legacyStudent = $legacyStudentInfoById[$studentId];
                }

                if ($legacyStudent === null && $username !== '') {
                    if (!array_key_exists($username, $legacyStudentInfoByCode)) {
                        $legacyStudentInfoByCode[$username] = $this->fetchLegacyStudentInfoByCode($username);
                    }

                    $legacyStudent = $legacyStudentInfoByCode[$username];
                }

                $fullName = isset($legacyStudent['fullName'])
                    ? trim((string) $legacyStudent['fullName'])
                    : '';

                $studentCode = isset($legacyStudent['studentCode'])
                    ? trim((string) $legacyStudent['studentCode'])
                    : '';

                return [
                    'id' => $registration->user?->id,
                    'studentCode' => $studentCode !== '' ? $studentCode : $username,
                    'fullName' => $fullName !== '' ? $fullName : null,
                    'registeredAt' => $registration->registered_at?->format('Y-m-d H:i:s'),
                ];
            })
            ->all();
    }

    private function findAccessibleTutorialPeriodOrFail(int $tutorialPeriodId): TutorialPeriod
    {
        try {
            return TutorialPeriod::query()
                ->whereIn('status', $this->allowedStatuses())
                ->findOrFail($tutorialPeriodId);
        } catch (ModelNotFoundException $exception) {
            throw new NotFoundHttpException('Tutorial period not found', $exception);
        }
    }

    /**
     * @return array<int, string>
     */
    private function allowedStatuses(): array
    {
        return [
            TutorialPeriodStatus::ASSIGNING->value,
            TutorialPeriodStatus::ONGOING->value,
            TutorialPeriodStatus::CLOSED->value,
        ];
    }

    /**
     * @return array{studentCode:string,lastName:string,firstName:string,fullName:string}|null
     */
    private function fetchLegacyStudentInfoById(int $studentId): ?array
    {
        try {
            return $this->legacyApiService->fetchStudentInfoByLegacyStudentId($studentId);
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @return array{studentCode:string,lastName:string,firstName:string,fullName:string}|null
     */
    private function fetchLegacyStudentInfoByCode(string $studentCode): ?array
    {
        try {
            return $this->legacyApiService->fetchStudentInfoByStudentCode($studentCode);
        } catch (Throwable) {
            return null;
        }
    }
}
