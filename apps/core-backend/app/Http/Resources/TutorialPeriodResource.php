<?php

namespace App\Http\Resources;

use App\States\TutorialPeriods\TutorialPeriodStateFactory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TutorialPeriodResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'academicPeriodId' => $this->academic_period_id,
            'academicPeriod' => $this->academic_period,
            'title' => $this->title,
            'description' => $this->description,
            'registrationStartAt' => $this->formatDateTime($this->registration_start_at),
            'registrationEndAt' => $this->formatDateTime($this->registration_end_at),
            'studyStartAt' => $this->formatDateTime($this->study_start_at),
            'studyEndAt' => $this->formatDateTime($this->study_end_at),
            'status' => $this->status?->name,
            'createdBy' => $this->whenLoaded('createdBy', function (): ?array {
                if (!$this->createdBy) {
                    return null;
                }

                return [
                    'id' => $this->createdBy->id,
                    'username' => $this->createdBy->username,
                ];
            }),
            'createdAt' => $this->formatDateTime($this->created_at),
            'updatedAt' => $this->formatDateTime($this->updated_at),
            'permissions' => app(TutorialPeriodStateFactory::class)->forStatus($this->status)->permissions(),
        ];
    }

    private function formatDateTime(mixed $value): ?string
    {
        return $value?->format('Y-m-d H:i:s');
    }
}
