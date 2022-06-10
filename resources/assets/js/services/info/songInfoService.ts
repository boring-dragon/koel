import { httpService } from '@/services'

interface SongInfoResponse {
  youtube: {
    items: YouTubeVideo[],
    nextPageToken: string
  },
  lyrics: string
}

export const songInfoService = {
  fetch: async (song: Song) => {
    if (!song.infoRetrieved) {
      const {
        lyrics,
        youtube
      } = await httpService.get<SongInfoResponse>(`song/${song.id}/info`)

      song.lyrics = lyrics
      song.youtube = youtube
      song.infoRetrieved = true
    }

    return song
  }
}
