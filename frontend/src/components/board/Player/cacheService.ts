import { cache } from '@solidjs/router'
import { Quality, Room } from '../../../service/types'
import { getLiveUrls, getQualities, getRoom } from '../../../service/platform'

export const cachedGetRoom = cache(async (room: Room): Promise<Room> => {
  return getRoom(room.platform.id, room.id)
}, 'getRoom')

export const cachedGetQualities = cache(
  async (room?: Room): Promise<Quality[]> => {
    if (!room) {
      return []
    }
    const qs = await getQualities(room.platform.id, room.id)
    return qs.sort((a, b) => b.priority - a.priority)
  },
  'getQualities',
)

export const cachedGetLiveUrls = cache(
  async (room?: Room, quality?: Quality): Promise<string[]> => {
    if (!room) {
      return []
    }
    if (!quality) {
      return []
    }
    return await getLiveUrls(room.platform.id, room.id, quality.id)
  },
  'getLiveUrls',
)
