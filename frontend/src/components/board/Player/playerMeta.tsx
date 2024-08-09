import {
  Accessor,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  ParentComponent,
  Setter,
  useContext,
} from 'solid-js'
import { LiveUrl, Quality, Room } from '../../../service/types'
import { createAsync } from '@solidjs/router'
import { cachedGetLiveUrls, cachedGetQualities } from './cacheService'

type VideoInfo = {
  width: number
  height: number
}

type Ctx = {
  qualities: Accessor<Quality[]>
  selectedQuality: Accessor<Quality | null>
  setSelectedQualityId: Setter<Quality['id'] | null>

  liveUrls: Accessor<LiveUrl[]>
  selectedLiveUrl: Accessor<LiveUrl | null>
  setSelectedLiveUrl: Setter<LiveUrl | null>

  videoInfo: Accessor<VideoInfo | null>
  setVideoInfo: Setter<VideoInfo | null>
}

const ctx = createContext<Ctx>()

export const usePlayerMeta = (): Ctx => {
  const _ctx = useContext(ctx)
  if (!_ctx) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return _ctx
}

export const PlayerMetaProvider: ParentComponent<{ room: Room }> = (props) => {
  const qualities = createAsync(() => cachedGetQualities(props.room), {
    initialValue: [],
  })
  const [selectedQualityId, setSelectedQualityId] = createSignal<
    Quality['id'] | null
  >(null)
  const selectedQuality = createMemo(() => {
    return qualities()?.find((q) => q.id === selectedQualityId()) || null
  })
  createEffect(() => {
    setSelectedQualityId(qualities()[0]?.id || null)
  })
  const liveUrls = createAsync(
    () => cachedGetLiveUrls(props.room, selectedQualityId()),
    { initialValue: [] },
  )
  const [selectedLiveUrl, setSelectedLiveUrl] = createSignal<LiveUrl | null>(
    liveUrls()[0] || null,
  )
  createEffect(() => {
    setSelectedLiveUrl(liveUrls()[0] || null)
  })
  const [videoInfo, setVideoInfo] = createSignal<VideoInfo | null>(null)
  const value: Ctx = {
    qualities,
    selectedQuality,
    setSelectedQualityId,

    liveUrls,
    selectedLiveUrl,
    setSelectedLiveUrl,

    videoInfo,
    setVideoInfo,
  }
  return <ctx.Provider value={value}>{props.children}</ctx.Provider>
}
