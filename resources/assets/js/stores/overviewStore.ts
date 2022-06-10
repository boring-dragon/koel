import { reactive } from 'vue'
import { httpService } from '@/services'
import { songStore } from '@/stores/songStore'
import { albumStore } from '@/stores/albumStore'
import { artistStore } from '@/stores/artistStore'

interface OverviewState {
  mostPlayedSongs: Song[]
  recentlyPlayedSongs: Song[]
  recentlyAddedSongs: Song[]
  recentlyAddedAlbums: Album[]
  topAlbums: Album[]
  topArtists: Artist[]
}

export const overviewStore = {
  state: reactive<OverviewState>({
    mostPlayedSongs: [],
    recentlyPlayedSongs: [],
    recentlyAddedAlbums: [],
    recentlyAddedSongs: [],
    topAlbums: [],
    topArtists: []
  }),

  async init () {
    const state = await httpService.get<OverviewState>('overview')

    this.state.mostPlayedSongs = songStore.syncWithVault(state.mostPlayedSongs)
    this.state.recentlyPlayedSongs = songStore.syncWithVault(state.recentlyPlayedSongs)
    this.state.recentlyAddedSongs = songStore.syncWithVault(state.recentlyAddedSongs)
    this.state.recentlyAddedAlbums = albumStore.syncWithVault(state.recentlyAddedAlbums)
    this.state.topAlbums = albumStore.syncWithVault(state.topAlbums)
    this.state.topArtists = artistStore.syncWithVault(state.topArtists)
  }
}
