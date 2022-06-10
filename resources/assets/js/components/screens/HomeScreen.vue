<template>
  <section id="homeWrapper">
    <ScreenHeader>{{ greeting }}</ScreenHeader>

    <div class="main-scroll-wrap" @scroll="scrolling">
      <div class="two-cols">
        <section v-if="mostPlayedSongs.length">
          <h1>Most Played</h1>

          <ol class="top-song-list">
            <li v-for="song in mostPlayedSongs" :key="song.id">
              <SongCard :song="song" :top-play-count="top.songs.length ? top.songs[0].playCount : 0"/>
            </li>
          </ol>
        </section>

        <section class="recent">
          <h1>
            Recently Played
            <Btn
              data-testid="home-view-all-recently-played-btn"
              @click.prevent="goToRecentlyPlayedScreen"
              rounded
              small
              orange
            >
              View All
            </Btn>
          </h1>

          <ol v-if="recentlyPlayedSongs.length" class="recent-song-list">
            <li v-for="song in recentlyPlayedSongs" :key="song.id">
              <SongCard :song="song" :top-play-count="top.songs.length ? top.songs[0].playCount : 0"/>
            </li>
          </ol>

          <p v-show="!recentlyPlayedSongs.length" class="text-secondary">
            Your recently played songs will be displayed here.<br/>
            Start listening!
          </p>
        </section>
      </div>

      <section v-if="showRecentlyAddedSection">
        <h1>Recently Added</h1>
        <div class="two-cols">
          <ol class="recently-added-album-list">
            <li v-for="album in recentlyAddedAlbums" :key="album.id">
              <AlbumCard :album="album" layout="compact"/>
            </li>
          </ol>
          <ol v-show="recentlyAddedSongs.length" class="recently-added-song-list">
            <li v-for="song in recentlyAddedSongs" :key="song.id">
              <SongCard :song="song"/>
            </li>
          </ol>
        </div>
      </section>

      <section v-if="topArtists.length">
        <h1>Top Artists</h1>
        <ol class="two-cols top-artist-list">
          <li v-for="artist in topArtists" :key="artist.id">
            <ArtistCard :artist="artist" layout="compact"/>
          </li>
        </ol>
      </section>

      <section v-if="topAlbums.length">
        <h1>Top Albums</h1>
        <ol class="two-cols top-album-list">
          <li v-for="album in topAlbums" :key="album.id">
            <AlbumCard :album="album" layout="compact"/>
          </li>
        </ol>
      </section>

      <ToTopButton/>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { sample } from 'lodash'
import { computed, defineAsyncComponent, reactive, ref, toRef } from 'vue'

import { eventBus, noop } from '@/utils'
import { overviewStore, userStore } from '@/stores'
import { useInfiniteScroll } from '@/composables'
import router from '@/router'

const ScreenHeader = defineAsyncComponent(() => import('@/components/ui/ScreenHeader.vue'))
const AlbumCard = defineAsyncComponent(() => import('@/components/album/AlbumCard.vue'))
const ArtistCard = defineAsyncComponent(() => import('@/components/artist/ArtistCard.vue'))
const SongCard = defineAsyncComponent(() => import('@/components/song/SongCard.vue'))
const Btn = defineAsyncComponent(() => import('@/components/ui/Btn.vue'))

const mostPlayedSongs = toRef(overviewStore.state, 'mostPlayedSongs')
const recentlyPlayedSongs = toRef(overviewStore.state, 'recentlyPlayedSongs')
const recentlyAddedAlbums = toRef(overviewStore.state, 'recentlyAddedAlbums')
const recentlyAddedSongs = toRef(overviewStore.state, 'recentlyAddedSongs')
const topArtists = toRef(overviewStore.state, 'topArtists')
const topAlbums = toRef(overviewStore.state, 'topAlbums')

const { ToTopButton, scrolling } = useInfiniteScroll(() => noop())

const greetings = [
  'Oh hai!',
  'Hey, %s!',
  'Howdy, %s!',
  'Yo!',
  'How’s it going, %s?',
  'Sup, %s?',
  'How’s life, %s?',
  'How’s your day, %s?',
  'How have you been, %s?'
]

const greeting = ref('')
const recentSongs = ref<Song[]>([])
let initialized = false

const top = reactive({
  songs: [] as Song[],
  albums: [] as Album[],
  artists: [] as Artist[]
})

const showRecentlyAddedSection = computed(() =>
  Boolean(recentlyAddedAlbums.value.length || recentlyAddedSongs.value.length)
)

const refreshDashboard = () => {
  console.warn('KOEL: Method refreshDashboard() not implemented')
}

const goToRecentlyPlayedScreen = () => router.go('recently-played')

eventBus.on(['KOEL_READY', 'SONG_STARTED', 'SONG_UPLOADED'], () => refreshDashboard())
eventBus.on('KOEL_READY', () => (greeting.value = sample(greetings)!.replace('%s', userStore.current.name)))

eventBus.on('LOAD_MAIN_CONTENT', async (view: MainViewName) => {
  if (view === 'Home' && !initialized) {
    await overviewStore.init()
    initialized = true
  }
})
</script>

<style lang="scss">
#homeWrapper {
  .two-cols {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-gap: .7em 1em;

    ol, li {
      overflow: hidden;
    }
  }

  .recent {
    h1 button {
      float: right;
      padding: 6px 10px;
      margin-top: -3px;
    }
  }

  ol {
    display: grid;
    grid-gap: .7em 1em;
    align-content: start;
  }

  .main-scroll-wrap {
    section {
      margin-bottom: 48px;
    }

    h1 {
      font-size: 1.4rem;
      margin: 0 0 1.8rem;
      font-weight: var(--font-weight-thin);
    }
  }

  @media only screen and (max-width: 768px) {
    .two-cols {
      grid-template-columns: 1fr;
    }
  }
}
</style>
