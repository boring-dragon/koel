import { difference } from 'lodash'
import { httpService } from '@/services'
import { arrayify, use } from '@/utils'
import { reactive } from 'vue'
import deepmerge from 'deepmerge'

interface AlbumStoreState {
  albums: Album[]
}

const UNKNOWN_ALBUM_ID = 1

export const albumStore = {
  vault: new Map<number, Album>(),

  state: reactive<AlbumStoreState>({
    albums: []
  }),

  get all () {
    return this.state.albums
  },

  set all (value) {
    this.state.albums = value
  },

  byId (id: number) {
    return this.vault.get(id)
  },

  byIds (ids: number[]) {
    const albums = [] as Album[]
    ids.forEach(id => use(this.byId(id), album => albums.push(album!)))
    return albums
  },

  add (albums: Album | Album[]) {
    arrayify(albums).forEach(album => this.all.push(album))
  },

  prepend (albums: Album | Album[]) {
    arrayify(albums).forEach(album => this.all.unshift(album))
  },

  /**
   * Remove empty albums from the store.
   */
  compact () {
    const emptyAlbums = this.all.filter(album => album.songs.length === 0)
    if (!emptyAlbums.length) {
      return
    }

    this.all = difference(this.all, emptyAlbums)
    emptyAlbums.forEach(album => this.vault.delete(album.id))
  },

  /**
   * Upload a cover for an album.
   *
   * @param {Album} album The album object
   * @param {string} cover The content data string of the cover
   */
  uploadCover: async (album: Album, cover: string) => {
    album.cover = (await httpService.put<{ coverUrl: string }>(`album/${album.id}/cover`, { cover })).coverUrl
    return album.cover
  },

  /**
   * Get the (blurry) thumbnail-sized version of an album's cover.
   */
  getThumbnail: async (album: Album) => {
    if (album.thumbnail === undefined) {
      album.thumbnail = (await httpService.get<{ thumbnailUrl: string }>(`album/${album.id}/thumbnail`)).thumbnailUrl
    }

    return album.thumbnail
  },

  isUnknownAlbum: (album: Album | number) => {
    if (typeof album === 'number') return album === UNKNOWN_ALBUM_ID
    return album.id === UNKNOWN_ALBUM_ID
  },

  syncWithVault (albums: Album | Album[]) {
    return arrayify(albums).map(album => {
      let local = this.vault.get(album.id)
      local = local ? deepmerge(local, album) : album
      this.vault.set(album.id, local)

      return local
    })
  },

  async resolve (id: number) {
    let album = this.vault.get(id)

    if (!album) {
      album = await httpService.get<Album>(`albums/${id}`)
      this.syncWithVault(album)
    }

    return album
  },

  async fetch (page: number) {
    const resource = await httpService.get<SimplePaginatorResource>(`albums?page=${page}`)
    this.state.albums.push(...this.syncWithVault(resource.data))

    return resource.links.next ? ++resource.meta.current_page : null
  }
}
