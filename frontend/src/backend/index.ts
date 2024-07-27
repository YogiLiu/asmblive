import {
  GetLiveUrls,
  GetPlatform,
  GetPlatforms,
  GetQualities,
  GetRoom,
} from 'wails/go/service/Service'
import { cache } from '@solidjs/router'
import { service } from 'wails/go/models.ts'

export default {
  GetPlatforms: GetPlatforms,
  GetPlatform: cache(
    (platformId: string): Promise<service.PlatformDto | null> =>
      GetPlatform(platformId),
    'GetPlatform',
  ),
  GetRoom: cache(
    (platformId: string, roomId: string): Promise<service.RoomDto | null> =>
      GetRoom(platformId, roomId),
    'GetRoom',
  ),
  GetQualities: cache(
    (
      platformId: string,
      roomId: string,
    ): Promise<service.QualityDto[] | null> => GetQualities(platformId, roomId),
    'GetRoom',
  ),
  GetLiveUrls: cache(
    (
      platformId: string,
      roomId: string,
      qualitityId: string,
    ): Promise<string[] | null> => GetLiveUrls(platformId, roomId, qualitityId),
    'GetRoom',
  ),
}
