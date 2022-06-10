import { reactive } from 'vue'
import slugify from 'slugify'
import isMobile from 'ismobilejs'
import { arrayify, secondsToHis, use } from '@/utils'
import { authService, httpService } from '@/services'
import { albumStore, artistStore, commonStore, favoriteStore, preferenceStore } from '.'
import deepmerge from 'deepmerge'

interface BroadcastSongData {
  song: {
    id: string
    title: string
    liked: boolean
    playbackState: PlaybackState
    album: {
      id: number
      name: string
      cover: string
    }
    artist: {
      id: number
      name: string
    }
  }
}

interface SongUpdateResult {
  songs: Song[]
  artists: Artist[]
  albums: Album[]
}

export const songStore = {
  vault: new Map<string, Song>(),

  state: reactive({
    songs: [] as Song[]
  }),

  /**
   * Initializes the interaction (like/play count) information.
   *
   * @param  {Interaction[]} interactions The array of interactions of the current user
   */
  initInteractions (interactions: Interaction[]) {
    favoriteStore.clear()

    interactions.forEach(interaction => {
      const song = this.byId(interaction.songId)

      if (!song) {
        return
      }

      song.liked = interaction.liked
      song.playCount = interaction.playCount
      song.album.playCount += song.playCount
      song.artist.playCount += song.playCount

      song.liked && favoriteStore.add(song)
    })
  },

  /**
   * Get the total duration of some songs.
   *
   * @param songs
   * @param {Boolean} formatted Whether to convert the duration into H:i:s format
   */
  getLength: (songs: Song[], formatted: boolean = false) => {
    const duration = songs.reduce((length, song) => length + song.length, 0)

    return formatted ? secondsToHis(duration) : duration
  },

  getFormattedLength (songs: Song[]) {
    return String(this.getLength(songs, true))
  },

  get all () {
    return this.state.songs
  },

  set all (value: Song[]) {
    this.state.songs = value
  },

  byId (id: string) {
    return this.vault.get(id)
  },

  byIds (ids: string[]) {
    const songs = [] as Song[]
    arrayify(ids).forEach(id => use(this.byId(id), song => songs.push(song!)))
    return songs
  },

  /**
   * Guess a song by its title and album.
   * Forget about Levenshtein distance, this implementation is good enough.
   */
  guess: (title: string, album: Album) => {
    title = slugify(title.toLowerCase())

    for (const song of album.songs) {
      if (slugify(song.title.toLowerCase()) === title) {
        return song
      }
    }

    return null
  },

  /**
   * Increase a play count for a song.
   */
  registerPlay: async (song: Song) => {
    const interaction = await httpService.post<Interaction>('interaction/play', { song: song.id })

    // Use the data from the server to make sure we don't miss a play from another device.
    song.playCount = interaction.playCount
  },

  scrobble: async (song: Song) => await httpService.post(`${song.id}/scrobble`, { timestamp: song.playStartTime }),

  async update (songsToUpdate: Song[], data: any) {
    const { songs, artists, albums } = await httpService.put<SongUpdateResult>('songs', {
      data,
      songs: songsToUpdate.map(song => song.id)
    })

    // Add the artist and album into stores if they're new
    artists.forEach(artist => !artistStore.byId(artist.id) && artistStore.add(artist))
    albums.forEach(album => !albumStore.byId(album.id) && albumStore.add(album))

    songs.forEach(song => {
      let originalSong = this.byId(song.id)!

      Object.assign(originalSong, song)
    })

    artistStore.compact()
    albumStore.compact()
  },

  getSourceUrl: (song: Song) => {
    return isMobile.any && preferenceStore.transcodeOnMobile
      ? `${commonStore.state.cdnUrl}play/${song.id}/1/128?api_token=${authService.getToken()}`
      : `${commonStore.state.cdnUrl}play/${song.id}?api_token=${authService.getToken()}`
  },

  getShareableUrl: (song: Song) => `${window.BASE_URL}#!/song/${song.id}`,

  generateDataToBroadcast: (song: Song): BroadcastSongData => ({
    song: {
      id: song.id,
      title: song.title,
      liked: song.liked,
      playbackState: song.playbackState || 'Stopped',
      album: {
        id: song.albumId,
        name: song.albumName,
        cover: song.albumCover
      },
      artist: {
        id: song.artistId,
        name: song.artistName
      }
    }
  }),

  syncWithVault (songs: Song[]) {
    return songs.map(song => {
      let local = this.vault.get(song.id)

      if (local) {
        local = deepmerge(local, song)
      } else {
        song.playbackState = 'Stopped'
        local = song
      }

      this.vault.set(song.id, local)

      return local
    })
  },

  async fetchForAlbum (album: Album) {
    return this.syncWithVault(await httpService.get<Song[]>(`albums/${album.id}/songs`))
  },

  async fetchForArtist (artist: Artist) {
    return this.syncWithVault(await httpService.get<Song[]>(`artists/${artist.id}/songs`))
  },

  async fetchForPlaylist (playlist: Playlist) {
    return this.syncWithVault(await httpService.get<Song[]>(`playlists/${playlist.id}/songs`))
  },

  async fetch (sortField: SongListSortField, sortOrder: SortOrder, page: number) {
    const resource = await httpService.get<SimplePaginatorResource>(
      `songs?page=${page}&sort=${sortField}&order=${sortOrder}`
    )

    this.state.songs.push(...this.syncWithVault(resource.data))

    return resource.links.next ? ++resource.meta.current_page : null
  }
}
