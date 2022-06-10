<?php

namespace App\Http\Resources;

use App\Models\Artist;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

class ArtistResource extends JsonResource
{
    public function __construct(private Artist $artist)
    {
        parent::__construct($artist);
    }

    /** @return array<mixed> */
    public function toArray($request): array
    {
        return [
            'type' => 'artists',
            'id' => $this->artist->id,
            'name' => $this->artist->name,
            'image' => $this->artist->image,
            'length' => $this->artist->length,
            'playCount' => (int) $this->artist->play_count,
            'songCount' => (int) $this->artist->song_count,
            'albumCount' => (int) $this->artist->album_count,
            'createdAt' => $this->artist->created_at,
            'info' => Arr::wrap($this->artist->information),
        ];
    }
}
