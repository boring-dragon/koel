import isMobile from 'ismobilejs'
import { reactive } from 'vue'

import { httpService } from '@/services'
import { playlistStore, preferenceStore, queueStore, settingStore, themeStore, userStore } from '.'

interface CommonStoreState {
  overview: {
    mostPlayedSongs: Song[],
    recentlyPlayedSongs: Song[],
    recentlyAddedSongs: Song[],
    recentlyAddedAlbums: Album[],
    topAlbums: Album[],
    topArtists: Artist[]
  },
  allowDownload: boolean
  cdnUrl: string
  currentUser: User | undefined
  currentVersion: string
  latestVersion: string
  playlists: Playlist[]
  settings: Settings
  useiTunes: boolean
  useLastfm: boolean
  users: User[]
  useYouTube: boolean
}

export const commonStore = {
  state: reactive<CommonStoreState>({
    overview: {
      mostPlayedSongs: [],
      recentlyPlayedSongs: [],
      recentlyAddedAlbums: [],
      recentlyAddedSongs: [],
      topAlbums: [],
      topArtists: []
    },
    allowDownload: false,
    cdnUrl: '',
    currentUser: undefined,
    currentVersion: '',
    latestVersion: '',
    playlists: [],
    settings: {} as Settings,
    useiTunes: false,
    useLastfm: false,
    users: [],
    useYouTube: false
  }),

  async init () {
    Object.assign(this.state, await httpService.get<CommonStoreState>('data'))

    // Always disable YouTube integration on mobile.
    this.state.useYouTube = this.state.useYouTube && !isMobile.phone

    // If this is a new user, initialize his preferences to be an empty object.
    this.state.currentUser!.preferences = this.state.currentUser!.preferences || {}

    userStore.init(this.state.users, this.state.currentUser!)
    preferenceStore.init(this.state.currentUser)
    playlistStore.init(this.state.playlists)
    queueStore.init()
    settingStore.init(this.state.settings)
    themeStore.init()

    return this.state
  }
}
