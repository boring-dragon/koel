<?php

namespace App\Repositories;

use App\Models\Artist;
use App\Models\Song;
use App\Models\User;
use App\Repositories\Traits\Searchable;
use Illuminate\Support\Collection;

class ArtistRepository extends AbstractRepository
{
    use Searchable;

    /** @return array<int> */
    public function getNonEmptyArtistIds(): array
    {
        return Song::select('artist_id')
            ->groupBy('artist_id')
            ->get()
            ->pluck('artist_id')
            ->toArray();
    }

    /** @return Collection|array<array-key, Artist> */
    public function getMostPlayed(int $count = 6, ?User $scopedUser = null): Collection
    {
        return Artist::withMeta($scopedUser ?? $this->auth->user())
            ->isStandard()
            ->orderByDesc('play_count')
            ->limit($count)
            ->get();
    }

    public function getOne(int $id, ?User $scopedUser = null): Artist
    {
        return Artist::withMeta($scopedUser ?? $this->auth->user())
            ->where('artists.id', $id)
            ->first();
    }
}
