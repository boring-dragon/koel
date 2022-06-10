<?php

namespace App\Repositories;

use App\Models\Album;
use App\Models\Artist;
use App\Models\Interaction;
use App\Models\Playlist;
use App\Models\Song;
use App\Models\User;
use App\Repositories\Traits\Searchable;
use App\Services\Helper;
use Illuminate\Contracts\Database\Query\Builder;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Webmozart\Assert\Assert;

class SongRepository extends AbstractRepository
{
    use Searchable;

    private const VALID_SORT_COLUMNS = ['songs.title', 'songs.track', 'songs.length', 'artists.name', 'albums.name'];

    public function __construct(private Helper $helper)
    {
        parent::__construct();
    }

    public function getOneByPath(string $path): ?Song
    {
        return $this->getOneById($this->helper->getFileHash($path));
    }

    /** @return Collection|array<Song> */
    public function getAllHostedOnS3(?User $scopedUser = null): Collection
    {
        return Song::withMeta($scopedUser ?? $this->auth->user())->hostedOnS3()->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getRecentlyAdded(int $count = 10, ?User $scopedUser = null): Collection
    {
        return Song::withMeta($scopedUser ?? $this->auth->user())->latest()->limit($count)->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getMostPlayed(int $count = 7, ?User $scopedUser = null): Collection
    {
        $scopedUser ??= $this->auth->user();

        return Song::withMeta($scopedUser)
            ->whereIn(
                'songs.id',
                Interaction::where('user_id', $scopedUser->id)
                    ->orderByDesc('play_count')
                    ->limit($count)
                    ->pluck('song_id')
                    ->all()
            )
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getRecentlyPlayed(int $count = 7, ?User $scopedUser = null): Collection
    {
        $scopedUser ??= $this->auth->user();

        return Song::withMeta($scopedUser)
            ->where('interactions.play_count', '>', 0)
            ->limit($count)
            ->orderByDesc('interactions.updated_at')
            ->get();

//        $interactionQuery = Interaction::where('user_id', $scopedUser->id)
//            ->where('play_count', '>', 0)
//            ->latest('updated_at');
//
//        if ($count) {
//            $interactionQuery->limit($count);
//        }
//
//        return Song::withMeta($scopedUser)->whereIn('songs.id', $interactionQuery->pluck('song_id')->all())->get();
    }

    private static function applySort(Builder $query, string $column, string $direction): Builder
    {
        Assert::oneOf($column, self::VALID_SORT_COLUMNS);
        Assert::oneOf(strtolower($direction), ['asc', 'desc']);

        $query->orderBy($column, $direction);

        if ($column === 'artists.name') {
            $query->orderBy('albums.name')
                ->orderBy('songs.disc')
                ->orderBy('songs.track')
                ->orderBy('songs.title');
        } elseif ($column === 'albums.name') {
            $query->orderBy('songs.disc')
                ->orderBy('songs.track')
                ->orderBy('songs.title');
        }

        return $query;
    }

    public function getForListing(
        string $sortColumn,
        string $sortDirection,
        ?User $scopedUser = null,
        int $perPage = 50
    ): Paginator {
        return self::applySort(
            Song::withMeta($scopedUser ?? $this->auth->user()),
            $sortColumn,
            $sortDirection
        )->simplePaginate($perPage);
    }

    /** @return Collection|array<array-key, Song> */
    public function getFavorites(?User $scopedUser = null): Collection
    {
        return Song::withMeta($scopedUser ?? $this->auth->user())->where('interactions.liked', true)->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getByAlbum(Album $album, ?User $scopedUser = null): Collection
    {
        return Song::withMeta($scopedUser ?? $this->auth->user())
            ->where('album_id', $album->id)
            ->orderBy('songs.track')
            ->orderBy('songs.disc')
            ->orderBy('songs.title')
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getByArtist(Artist $artist, ?User $scopedUser = null): Collection
    {
        return Song::withMeta($scopedUser ?? $this->auth->user())
            ->where('songs.artist_id', $artist->id)
            ->orderBy('albums.name')
            ->orderBy('songs.track')
            ->orderBy('songs.disc')
            ->orderBy('songs.title')
            ->get();
    }

    /** @return Collection|array<array-key, Song> */
    public function getByStandardPlaylist(Playlist $playlist, ?User $scopedUser = null): Collection
    {
        return Song::withMeta($scopedUser ?? $this->auth->user())
            ->leftJoin('playlist_song', 'songs.id', '=', 'playlist_song.song_id')
            ->leftJoin('playlists', 'playlists.id', '=', 'playlist_song.playlist_id')
            ->where('playlists.id', $playlist->id)
            ->orderBy('songs.title')
            ->get();
    }
}
