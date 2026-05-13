<?php

namespace App\Models;

use App\Enums\TutorialPeriodStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorialPeriodStatusLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'tutorial_period_id',
        'old_status',
        'new_status',
        'changed_by',
        'note',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'old_status' => TutorialPeriodStatus::class,
            'new_status' => TutorialPeriodStatus::class,
        ];
    }

    public function tutorialPeriod(): BelongsTo
    {
        return $this->belongsTo(TutorialPeriod::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
