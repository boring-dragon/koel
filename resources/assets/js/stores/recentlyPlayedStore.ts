import { httpService } from '@/services'
import { remove } from 'lodash'
import { reactive } from 'vue'
import { songStore } from '@/stores/songStore'

const EXCERPT_COUNT = 7

export const recentlyPlayedStore = {
  excerptState: reactive({
    songs: [] as Song[]
  }),

  state: reactive({
    songs: [] as Song[]
  }),

  async fetch () {
    this.state.songs = songStore.syncWithVault(await httpService.get<Song[]>('recently-played'))
  },

  add (song: Song) {
    [this.state, this.excerptState].forEach(state => {
      // make sure there's no duplicate
      remove(state.songs, s => s.id === song.id)
      state.songs.unshift(song)
    })

    this.excerptState.songs.splice(EXCERPT_COUNT)
  }
}
