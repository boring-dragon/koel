<?php

namespace App\Repositories;

use App\Models\Album;
use App\Models\Song;
use App\Models\User;
use App\Repositories\Traits\Searchable;
use Illuminate\Support\Collection;

class AlbumRepository extends AbstractRepository
{
    use Searchable;

    /** @return array<int> */
    public function getNonEmptyAlbumIds(): array
    {
        return Song::select('album_id')
            ->groupBy('album_id')
            ->get()
            ->pluck('album_id')
            ->toArray();
    }

    public function getOne(int $id, ?User $scopedUser = null): Album
    {
        $scopedUser ??= $this->auth->user();

        return Album::withMeta($scopedUser)
            ->where('albums.id', $id)
            ->first();
    }

    /** @return Collection|array<array-key, Album> */
    public function getRecentlyAdded(int $count = 6, ?User $scopedUser = null): Collection
    {
        return Album::withMeta($scopedUser ?? $this->auth->user())
            ->isStandard()
            ->latest('albums.created_at')
            ->limit($count)
            ->get();
    }

    /** @return Collection|array<array-key, Album> */
    public function getMostPlayed(int $count = 6, ?User $scopedUser = null): Collection
    {
        $scopedUser ??= $this->auth->user();

        return Album::withMeta($scopedUser ?? $this->auth->user())
            ->isStandard()
            ->orderByDesc('play_count')
            ->limit($count)
            ->get();
    }
}
