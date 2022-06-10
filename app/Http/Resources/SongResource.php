<?php

namespace App\Http\Resources;

use App\Models\Song;
use Illuminate\Http\Resources\Json\JsonResource;

class SongResource extends JsonResource
{
    public function __construct(private Song $song)
    {
        parent::__construct($song);
    }

    /** @return array<mixed> */
    public function toArray($request): array
    {
        return [
            'type' => 'songs',
            'id' => $this->song->id,
            'title' => $this->song->title,
            'lyrics' => $this->song->lyrics,
            'albumId' => $this->song->album->id,
            'albumName' => $this->song->album->name,
            'artistId' => $this->song->artist->id,
            'artistName' => $this->song->artist->name,
            'albumCover' => $this->song->album->cover,
            'length' => $this->song->length,
            'liked' => (bool) $this->song->liked,
            'playCount' => (int) $this->song->play_count,
            'track' => $this->song->track,
            'disc' => $this->song->disc,
            'createdAt' => $this->song->created_at,
        ];
    }
}
