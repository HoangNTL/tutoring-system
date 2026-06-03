<?php

namespace App\Models;

use App\Enums\TutorialRegistrationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TutorialRegistration extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'tutorial_period_id',
        'user_id',
        'course_code',
        'course_name',
        'credits',
        'status',
        'registered_at',
        'cancelled_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tutorial_period_id' => 'integer',
            'user_id' => 'integer',
            'credits' => 'integer',
            'registered_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'status' => TutorialRegistrationStatus::class,
        ];
    }

    public function tutorialPeriod(): BelongsTo
    {
        return $this->belongsTo(TutorialPeriod::class, 'tutorial_period_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
