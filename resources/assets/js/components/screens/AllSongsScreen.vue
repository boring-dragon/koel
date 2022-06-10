<template>
  <section id="songsWrapper">
    <ScreenHeader>
      All Songs
      <ControlsToggler :showing-controls="showingControls" @toggleControls="toggleControls"/>

      <template v-slot:meta>
        <span v-if="songs.length">{{ pluralize(songs.length, 'song') }} • {{ duration }}</span>
      </template>

      <template v-slot:controls>
        <SongListControls
          v-if="songs.length && (!isPhone || showingControls)"
          @playAll="playAll"
          @playSelected="playSelected"
          :songs="songs"
          :config="songListControlConfig"
          :selectedSongs="selectedSongs"
        />
      </template>
    </ScreenHeader>

    <SongList
      ref="songList"
      :items="songs"
      type="all-songs"
      @press:enter="onPressEnter"
      @scrolled-to-end="fetchSongs"
      @sort="sort"
    />
  </section>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, ref, toRef } from 'vue'
import { eventBus, pluralize } from '@/utils'
import { songStore } from '@/stores'
import { useSongList } from '@/composables'

const ScreenHeader = defineAsyncComponent(() => import('@/components/ui/ScreenHeader.vue'))

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
} = useSongList(toRef(songStore.state, 'songs'))

let initialized = false
let loading = false
let sortField: SongListSortField = 'songs.title' // @todo get from query string
let sortOrder: SortOrder = 'asc'

const page = ref<number | null>(1)
const moreSongsAvailable = computed(() => page.value !== null)

const sort = async (field: SongListSortField, order: SortOrder) => {
  page.value = 1
  songStore.state.songs = []
  sortField = field
  sortOrder = order

  await fetchSongs()
}

const fetchSongs = async () => {
  if (!moreSongsAvailable.value || loading) return

  loading = true
  page.value = await songStore.fetch(sortField, sortOrder, page.value!)
  loading = false
}

eventBus.on('LOAD_MAIN_CONTENT', async (view: MainViewName) => {
  if (view === 'Songs' && !initialized) {
    await fetchSongs()
    initialized = true
  }
})
</script>
