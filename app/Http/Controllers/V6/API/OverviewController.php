<?php

namespace App\Http\Controllers\V6\API;

use App\Http\Controllers\API\Controller;
use App\Http\Resources\AlbumResource;
use App\Http\Resources\ArtistResource;
use App\Http\Resources\SongResource;
use App\Repositories\AlbumRepository;
use App\Repositories\ArtistRepository;
use App\Repositories\SongRepository;

class OverviewController extends Controller
{
    public function __construct(
        private SongRepository $songRepository,
        private AlbumRepository $albumRepository,
        private ArtistRepository $artistRepository
    ) {
    }

    public function index()
    {
        return response()->json([
            'mostPlayedSongs' => SongResource::collection($this->songRepository->getMostPlayed()),
            'recentlyPlayedSongs' => SongResource::collection($this->songRepository->getRecentlyPlayed()),
            'recentlyAddedAlbums' => AlbumResource::collection($this->albumRepository->getRecentlyAdded()),
            'recentlyAddedSongs' => SongResource::collection($this->songRepository->getRecentlyAdded()),
            'topArtists' => ArtistResource::collection($this->artistRepository->getMostPlayed()),
            'topAlbums' => AlbumResource::collection($this->albumRepository->getMostPlayed()),
        ]);
    }
}
