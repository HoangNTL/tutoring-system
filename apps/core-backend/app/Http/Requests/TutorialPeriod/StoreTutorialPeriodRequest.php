<?php

namespace App\Http\Requests\TutorialPeriod;

use App\Enums\TutorialPeriodStatus;
use App\Http\Requests\BaseFormRequest;
use Carbon\Carbon;
use Illuminate\Validation\Validator;

class StoreTutorialPeriodRequest extends BaseFormRequest
{
    private const DEFAULT_MINIMUM_ASSIGNMENT_DAYS = 1;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_period_id' => ['required', 'integer', 'min:1'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'registration_start_at' => ['required', 'date', 'before_or_equal:registration_end_at'],
            'registration_end_at' => ['required', 'date', 'after_or_equal:registration_start_at', 'before:study_start_at'],
            'study_start_at' => ['required', 'date', 'after:registration_end_at', 'before_or_equal:study_end_at'],
            'study_end_at' => ['required', 'date', 'after_or_equal:study_start_at'],
            'status' => ['sometimes', 'string', 'in:' . implode(',', array_map(
                static fn (TutorialPeriodStatus $status): string => $status->name,
                TutorialPeriodStatus::cases()
            ))],
        ];
    }

    public function attributes(): array
    {
        return [
            'academic_period_id' => 'academicPeriodId',
            'registration_start_at' => 'registrationStartAt',
            'registration_end_at' => 'registrationEndAt',
            'study_start_at' => 'studyStartAt',
            'study_end_at' => 'studyEndAt',
            'status' => 'status',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $registrationEndAt = $this->input('registration_end_at');
            $studyStartAt = $this->input('study_start_at');
            $minimumAssignmentDays = (int) config('tutorial.minimum_assignment_days', self::DEFAULT_MINIMUM_ASSIGNMENT_DAYS);

            if (!$registrationEndAt || !$studyStartAt) {
                return;
            }

            $registrationEnd = Carbon::parse($registrationEndAt)->startOfDay();
            $studyStart = Carbon::parse($studyStartAt)->startOfDay();
            $minimumStudyStart = $registrationEnd->copy()->addDays($minimumAssignmentDays + 1);

            if ($minimumStudyStart->gt($studyStart)) {
                $validator->errors()->add(
                    'study_start_at',
                    "Cần có ít nhất {$minimumAssignmentDays} ngày trống giữa thời gian đăng ký và thời gian học để bộ môn phân công."
                );
            }
        });
    }
}
