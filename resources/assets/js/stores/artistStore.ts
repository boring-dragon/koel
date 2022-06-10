import { difference } from 'lodash'

import { httpService } from '@/services'
import { arrayify, use } from '@/utils'
import { reactive } from 'vue'
import deepmerge from 'deepmerge'

interface ArtistStoreState {
  artists: Artist[]
}

const UNKNOWN_ARTIST_ID = 1
const VARIOUS_ARTISTS_ID = 2

export const artistStore = {
  vault: new Map<number, Artist>(),

  state: reactive<ArtistStoreState>({
    artists: []
  }),

  get all () {
    return this.state.artists
  },

  set all (value: Artist[]) {
    this.state.artists = value
  },

  byId (id: number) {
    return this.vault[id]
  },

  byIds (ids: number[]) {
    const artists = [] as Artist[]
    ids.forEach(id => use(this.byId(id), artist => artists.push(artist!)))
    return artists
  },

  add (artists: Artist | Artist[]) {
    arrayify(artists).forEach(artist => this.all.push(artist))
  },

  prepend (artists: Artist | Artist[]) {
    arrayify(artists).forEach(artist => this.all.unshift(artist))
  },

  /**
   * Remove empty artists from the store.
   */
  compact () {
    const emptyArtists = this.all.filter(artist => artist.songs.length === 0)

    if (!emptyArtists.length) {
      return
    }

    this.all = difference(this.all, emptyArtists)
    emptyArtists.forEach(artist => this.vault.delete(artist.id))
  },

  isVariousArtists: (artist: Artist | number) => {
    if (typeof artist === 'number') return artist === VARIOUS_ARTISTS_ID
    return artist.id === VARIOUS_ARTISTS_ID
  },

  isUnknownArtist: (artist: Artist | number) => {
    if (typeof artist === 'number') return artist === UNKNOWN_ARTIST_ID
    return artist.id === UNKNOWN_ARTIST_ID
  },

  /**
   * Upload an image for an artist.
   *
   * @param {Artist} artist The artist object
   * @param {string} image The content data string of the image
   */
  uploadImage: async (artist: Artist, image: string) => {
    const { imageUrl } = await httpService.put<{ imageUrl: string }>(`artist/${artist.id}/image`, { image })
    artist.image = imageUrl
    return artist.image
  },

  syncWithVault (artists: Artist | Artist[]) {
    return arrayify(artists).map(artist => {
      let local = this.vault.get(artist.id)
      local = local ? deepmerge(local, artist) : artist
      this.vault.set(artist.id, local)

      return local
    })
  },

  async resolve (id: number) {
    let artist = this.byId(id)

    if (!artist) {
      artist = await httpService.get<Artist>(`artists/${id}`)
      this.syncWithVault(artist)
    }

    return artist
  },

  async fetch (page: number) {
    const resource = await httpService.get<SimplePaginatorResource>(`artists?page=${page}`)
    this.state.artists.push(...this.syncWithVault(resource.data))

    return resource.links.next ? ++resource.meta.current_page : null
  }
}
