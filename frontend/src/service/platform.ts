import { Platform, Quality, Room } from './types'
import {
  GetLiveUrls,
  GetPlatforms,
  GetQualities,
  GetRoom,
} from 'wails/go/service/PlatformService'

export const getRoom = async (
  platfomtId: string,
  roomId: string,
): Promise<Room> => {
  const r = await GetRoom(platfomtId, roomId)
  return {
    id: r.id,
    title: r.title,
    owner: {
      id: r.owner.id,
      name: r.owner.name,
      avatarUrl: r.owner.avatarUrl,
    },
    isOnline: r.isOnline,
    coverUrl: r.coverUrl,
    platform: {
      id: r.platform.id,
      name: r.platform.name,
      iconUrl: r.platform.iconUrl,
    },
  }
}

export const getPlatforms = async (): Promise<Platform[]> => {
  const ps = await GetPlatforms()
  return ps.map((p) => ({
    id: p.id,
    name: p.name,
    iconUrl: p.iconUrl,
  }))
}

export const getQualities = async (
  platformId: string,
  roomId: string,
): Promise<Quality[]> => {
  const qs = await GetQualities(platformId, roomId)
  return qs.map((q) => ({
    id: q.id,
    name: q.name,
    priority: q.priority,
  }))
}

export const getLiveUrls = async (
  platformId: string,
  roomId: string,
  qualityId: string,
): Promise<string[]> => {
  return await GetLiveUrls(platformId, roomId, qualityId)
}
