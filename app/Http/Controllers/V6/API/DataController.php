<?php

namespace App\Http\Controllers\V6\API;

use App\Http\Controllers\API\Controller;
use App\Models\User;
use App\Repositories\PlaylistRepository;
use App\Repositories\SettingRepository;
use App\Services\ApplicationInformationService;
use App\Services\ITunesService;
use App\Services\LastfmService;
use App\Services\YouTubeService;
use Illuminate\Contracts\Auth\Authenticatable;

class DataController extends Controller
{
    /** @param User $user */
    public function __construct(
        private LastfmService $lastfmService,
        private YouTubeService $youTubeService,
        private ITunesService $iTunesService,
        private SettingRepository $settingRepository,
        private PlaylistRepository $playlistRepository,
        private ApplicationInformationService $applicationInformationService,
        private ?Authenticatable $user
    ) {
    }

    public function index()
    {
        return response()->json([
            'settings' => $this->user->is_admin ? $this->settingRepository->getAllAsKeyValueArray() : [],
            'playlists' => $this->playlistRepository->getAllByCurrentUser(),
            'currentUser' => $this->user,
            'useLastfm' => $this->lastfmService->used(),
            'useYouTube' => $this->youTubeService->enabled(),
            'useiTunes' => $this->iTunesService->used(),
            'allowDownload' => config('koel.download.allow'),
            'supportsTranscoding' => config('koel.streaming.ffmpeg_path')
                && is_executable(config('koel.streaming.ffmpeg_path')),
            'cdnUrl' => static_url(),
            'currentVersion' => koel_version(),
            'latestVersion' => $this->user->is_admin
                ? $this->applicationInformationService->getLatestVersionNumber()
                : koel_version(),
        ]);
    }
}
