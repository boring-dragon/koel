<?php

namespace App\Http\Resources;

use App\Models\Interaction;
use Illuminate\Http\Resources\Json\JsonResource;

class InteractionResource extends JsonResource
{
    public function __construct(private Interaction $interaction)
    {
        parent::__construct($interaction);
    }

    /** @return array<mixed> */
    public function toArray($request): array
    {
        return [
            'type' => 'interactions',
            'id' => $this->interaction->id,
            'songId' => $this->interaction->song_id,
            'liked' => $this->interaction->liked,
            'playCount' => $this->interaction->play_count,
        ];
    }
}
