<?php

namespace App\Http\Resources;

use App\Models\Album;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Arr;

class AlbumResource extends JsonResource
{
    public function __construct(private Album $album)
    {
        parent::__construct($album);
    }

    /** @return array<mixed> */
    public function toArray($request): array
    {
        return [
            'type' => 'albums',
            'id' => $this->album->id,
            'name' => $this->album->name,
            'artistId' => $this->album->artist_id,
            'artistName' => $this->album->artist->name,
            'cover' => $this->album->cover,
            'createdAt' => $this->album->created_at,
            'isCompilation' => $this->album->is_compilation,
            'length' => $this->album->length,
            'playCount' => (int) $this->album->play_count,
            'songCount' => (int) $this->album->song_count,
            'info' => Arr::wrap($this->album->information),
        ];
    }
}
