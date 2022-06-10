import factory from 'factoria'
import crypto from 'crypto-random-string'
import { Faker } from '@faker-js/faker'

export default (faker: Faker): Song => {
  const artist = factory<Artist>('artist')
  const album = factory<Album>('album', {
    artist,
    artist_id: artist.id
  })

  return {
    type: 'songs',
    artist,
    album,
    artist_id: artist.id,
    artistId: artist.id,
    album_id: album.id,
    albumId: album.id,
    artistName: artist.name,
    albumName: album.name,
    albumCover: album.cover,
    id: crypto(32),
    title: faker.lorem.sentence(),
    length: faker.datatype.number(),
    track: faker.datatype.number(),
    disc: faker.datatype.number({ min: 1, max: 2 }),
    lyrics: faker.lorem.paragraph(),
    playCount: 0,
    liked: true
  }
}
