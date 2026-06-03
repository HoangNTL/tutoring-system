<?php

namespace App\Http\Requests\TutorialPeriod;

use App\Http\Requests\BaseFormRequest;
use Carbon\Carbon;
use App\Models\TutorialPeriod;
use Illuminate\Validation\Validator;

class UpdateTutorialPeriodRequest extends BaseFormRequest
{
    private const DEFAULT_MINIMUM_ASSIGNMENT_DAYS = 1;

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_period_id' => ['sometimes', 'integer', 'min:1'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'registration_start_at' => ['sometimes', 'date', 'before_or_equal:registration_end_at'],
            'registration_end_at' => ['sometimes', 'date', 'after_or_equal:registration_start_at', 'before:study_start_at'],
            'study_start_at' => ['sometimes', 'date', 'after:registration_end_at', 'before_or_equal:study_end_at'],
            'study_end_at' => ['sometimes', 'date', 'after_or_equal:study_start_at'],
        ];
    }

    protected function afterPrepareForValidation(): void
    {
        $payload = $this->all();

        /** @var TutorialPeriod|null $tutorialPeriod */
        $tutorialPeriod = $this->route('tutorial_period');

        if ($tutorialPeriod !== null) {
            foreach ([
                'registration_start_at',
                'registration_end_at',
                'study_start_at',
                'study_end_at',
            ] as $field) {
                if (!array_key_exists($field, $payload) && $tutorialPeriod->{$field} !== null) {
                    $payload[$field] = $tutorialPeriod->{$field}->format('Y-m-d H:i:s');
                }
            }
        }

        $this->merge($payload);
    }

    public function attributes(): array
    {
        return [
            'academic_period_id' => 'academicPeriodId',
            'registration_start_at' => 'registrationStartAt',
            'registration_end_at' => 'registrationEndAt',
            'study_start_at' => 'studyStartAt',
            'study_end_at' => 'studyEndAt',
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
