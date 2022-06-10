<template>
  <section id="albumWrapper">
    <ScreenHeader has-thumbnail>
      {{ album.name }}
      <ControlsToggler :showing-controls="showingControls" @toggleControls="toggleControls"/>

      <template v-slot:thumbnail>
        <AlbumThumbnail :entity="album"/>
      </template>

      <template v-slot:meta>
        <span>
          by
          <a v-if="isNormalArtist" :href="`#!/artist/${album.artistId}`" class="artist">{{ album.artistName }}</a>
          <span class="nope" v-else>{{ album.artistName }}</span>
          <template v-if="songs.length">
          •
          {{ pluralize(songs.length, 'song') }}
          •
          {{ duration }}
          </template>

          <template v-if="useLastfm">
            •
            <a class="info" href title="View album's extra information" @click.prevent="showInfo">Info</a>
          </template>

          <template v-if="allowDownload && songs.length">
            •
            <a class="download" href role="button" title="Download all songs in album" @click.prevent="download">
              Download All
            </a>
          </template>
        </span>
      </template>

      <template v-slot:controls>
        <SongListControls
          v-if="songs.length && (!isPhone || showingControls)"
          :config="songListControlConfig"
          :selectedSongs="selectedSongs"
          :songs="songs"
          @playAll="playAll"
          @playSelected="playSelected"
        />
      </template>
    </ScreenHeader>

    <SongList ref="songList" :config="listConfig" :items="songs" type="album" @press:enter="onPressEnter"/>

    <section v-if="useLastfm && showingInfo" class="info-wrapper">
      <CloseModalBtn @click="showingInfo = false"/>
      <div class="inner">
        <AlbumInfo :album="album" mode="full"/>
      </div>
    </section>
  </section>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, ref, toRef, toRefs, watch } from 'vue'
import { pluralize } from '@/utils'
import { artistStore, commonStore, songStore } from '@/stores'
import { downloadService } from '@/services'
import { useSongList } from '@/composables'
import router from '@/router'

const ScreenHeader = defineAsyncComponent(() => import('@/components/ui/ScreenHeader.vue'))
const AlbumInfo = defineAsyncComponent(() => import('@/components/album/AlbumInfo.vue'))
const SoundBar = defineAsyncComponent(() => import('@/components/ui/SoundBar.vue'))
const AlbumThumbnail = defineAsyncComponent(() => import('@/components/ui/AlbumArtistThumbnail.vue'))
const CloseModalBtn = defineAsyncComponent(() => import('@/components/ui/BtnCloseModal.vue'))

const props = defineProps<{ album: Album }>()
const { album } = toRefs(props)

const albumSongs = ref<Song[]>([])

const {
  SongList,
  SongListControls,
  ControlsToggler,
  songs,
  songList,
  duration,
  selectedSongs,
  showingControls,
  songListControlConfig,
  isPhone,
  onPressEnter,
  playAll,
  playSelected,
  toggleControls
} = useSongList(albumSongs)

const listConfig: Partial<SongListConfig> = { columns: ['track', 'title', 'length'] }
const useLastfm = toRef(commonStore.state, 'useLastfm')
const allowDownload = toRef(commonStore.state, 'allowDownload')
const showingInfo = ref(false)

const isNormalArtist = computed(() => {
  return !artistStore.isVariousArtists(album.value.artistId) && !artistStore.isUnknownArtist(album.value.artistId)
})

/**
 * Watch the album's song count.
 * If this is changed to 0, the user has edited the songs on this album
 * and moved all of them into another album.
 * We should then go back to the album list.
 */
watch(() => album.value.songCount, newSongCount => newSongCount || router.go('albums'))

const download = () => downloadService.fromAlbum(album.value)
const showInfo = () => (showingInfo.value = true)

onMounted(async () => {
  albumSongs.value = await songStore.fetchForAlbum(album.value)
})
</script>

<style lang="scss" scoped>
#albumWrapper {
  @include artist-album-info-wrapper();
}
</style>
