import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import { Quality, Room } from '../../service/types'
import { cache, createAsync } from '@solidjs/router'
import { getLiveUrls, getQualities, getRoom } from '../../service/platform'
import Hls from 'hls.js'

type Props = {
  room: Room
}

const cachedGetRoom = cache(async (room: Room): Promise<Room> => {
  return getRoom(room.platform.id, room.id)
}, 'getRoom')

const cachedGetQualities = cache(async (room?: Room): Promise<Quality[]> => {
  if (!room) {
    return []
  }
  const qs = await getQualities(room.platform.id, room.id)
  return qs.sort((a, b) => b.priority - a.priority)
}, 'getQualities')

const cachedGetLiveUrls = cache(
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

const Player: Component<Props> = (props) => {
  const room = createAsync(() => cachedGetRoom(props.room))
  const qualities = createAsync(() => cachedGetQualities(room()))
  const [selectedQuality, setSelectedQuality] = createSignal<
    Quality | undefined
  >(qualities()?.[0])
  createEffect(() => {
    setSelectedQuality(qualities()?.[0])
  })
  const liveUrls = createAsync(() =>
    cachedGetLiveUrls(room(), selectedQuality()),
  )
  const [selectLiveUrl, setSelectLiveUrl] = createSignal<string | undefined>(
    liveUrls()?.[0],
  )
  createEffect(() => {
    setSelectLiveUrl(liveUrls()?.[0])
  })
  const [showInfo, setShowInfo] = createSignal(false)
  let playerRef: HTMLDivElement
  onMount(() => {
    let timer: number
    playerRef.addEventListener('mousemove', () => {
      setShowInfo(true)
      clearTimeout(timer)
      timer = window.setTimeout(() => {
        setShowInfo(false)
      }, 1000)
    })
    playerRef.addEventListener('mouseleave', () => {
      setShowInfo(false)
      clearTimeout(timer)
    })
  })
  return (
    <div
      class={
        'bg-accent-content shadow-md overflow-hidden aspect-video *:w-full *:h-full relative'
      }
      ref={playerRef!}
    >
      <Suspense fallback={<Loading />}>
        <Show when={room()?.isOnline} fallback={<Offline />}>
          <Show when={selectedQuality()}>
            <Show when={selectLiveUrl()}>
              <Video url={selectLiveUrl()!} poster={room()!.coverUrl} />
            </Show>
          </Show>
        </Show>
        <Show when={room()}>
          <div
            class={
              'absolute top-0 left-0 !h-fit bg-gradient-to-t from-transparent to-base-content text-base-100 pb-6 pt-2 px-2 flex items-center gap-2'
            }
            classList={{
              hidden: !showInfo(),
              block: showInfo(),
            }}
          >
            <div class={'avatar'}>
              <div class={'w-10 rounded-full relative'}>
                <img src={room()!.owner.avatarUrl} alt={'avatar'} />
              </div>
              <img
                class={
                  'absolute bottom-0 right-0 !w-5 !h-5 rounded-full bg-base-100 p-1'
                }
                src={room()!.platform.iconUrl}
                alt={'platform'}
              />
            </div>
            <div>{room()!.owner.name}</div>
          </div>
        </Show>
      </Suspense>
    </div>
  )
}

export default Player

const Loading: Component = () => {
  return (
    <div class={'flex justify-center items-center text-neutral-content'}>
      <span class={'loading loading-bars loading-md'} />
    </div>
  )
}

const Offline: Component = () => {
  return (
    <div
      class={'flex flex-col justify-center items-center text-neutral-content'}
    >
      <span class={'iconify ph--receipt-x text-5xl '} />
      <span class={'font-light text-sm'}>未开播</span>
    </div>
  )
}

type VideoProps = {
  url: string
  poster?: string
}

const Video: Component<VideoProps> = (props) => {
  let wrapperRef: HTMLDivElement
  let videoRef: HTMLVideoElement
  onMount(() => {
    if (!videoRef) {
      return
    }
    const u = new URL(props.url)
    if (!u.pathname.endsWith('m3u8')) {
      videoRef.src = props.url
      return
    }
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(props.url)
      hls.attachMedia(videoRef)
      onCleanup(() => hls.destroy())
    } else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.src = props.url
    }
  })
  const [isLoading, setIsLoading] = createSignal(true)
  const [isFullscreen, setIsFullscreen] = createSignal(false)
  onMount(() => {
    wrapperRef.addEventListener('fullscreenchange', () => {
      setIsFullscreen(document.fullscreenElement === wrapperRef)
    })
  })
  return (
    <div class={'relative w-full h-full'} ref={wrapperRef!}>
      <video
        class={'w-full h-full'}
        controls={false}
        muted={true}
        autoplay={true}
        poster={props.poster}
        ref={videoRef!}
        onWaiting={() => setIsLoading(false)}
        onPlaying={() => setIsLoading(false)}
      />
      <Show when={isLoading()}>
        <div
          class={
            'absolute top-0 left-0 w-full h-full flex justify-center items-center'
          }
        >
          <Loading />
        </div>
      </Show>
      <Controls
        onVolumeChange={(v) => {
          videoRef.muted = v === 0
          videoRef.volume = v
        }}
        isFullscreen={isFullscreen()}
        onFullscreen={(s) => {
          if (s) {
            wrapperRef.requestFullscreen()
          } else {
            document.exitFullscreen()
          }
        }}
      />
    </div>
  )
}

type ControlsProps = {
  onVolumeChange?: (volume: number) => void
  isFullscreen: boolean
  onFullscreen?: (status: boolean) => void
}

const Controls: Component<ControlsProps> = (props) => {
  let ref: HTMLDivElement
  const [open, setOpen] = createSignal(false)
  const [canClose, setCanClose] = createSignal(true)
  onMount(() => {
    let timer: number
    ref.addEventListener('mousemove', () => {
      setOpen(true)
      clearTimeout(timer)
      if (!canClose()) {
        return
      }
      timer = window.setTimeout(() => {
        setOpen(false)
      }, 1000)
    })
    ref.addEventListener('mouseleave', () => {
      setOpen(false)
      clearTimeout(timer)
    })
    onCleanup(() => clearTimeout(timer))
  })
  const [volume, setVolume] = createSignal(0)
  const [isMuted, setIsMuted] = createSignal(true)
  return (
    <div
      class={'absolute w-full h-full top-0 left-0'}
      classList={{
        'cursor-none': props.isFullscreen && !open(),
      }}
      ref={ref!}
    >
      <div
        class={'relative w-full h-full text-base-300'}
        classList={{
          hidden: !open(),
          block: open(),
        }}
      >
        <div
          class={
            'absolute bottom-0 left-0 w-full p-4 bg-gradient-to-b from-transparent to-base-content flex justify-between text-xl'
          }
          onMouseEnter={() => setCanClose(false)}
          onMouseLeave={() => setCanClose(true)}
        >
          <div class={'flex-grow'}>
            <div class={'flex items-center'}>
              <span
                class={'iconify cursor-pointer'}
                classList={{
                  'ph--speaker-simple-high-bold': !isMuted() && volume() >= 50,
                  'ph--speaker-simple-low-bold': !isMuted() && volume() < 50,
                  'ph--speaker-simple-x-bold': isMuted(),
                }}
                onClick={() => {
                  if (volume() === 0) {
                    props.onVolumeChange?.(isMuted() ? 0.6 : 0)
                    setVolume(100)
                  } else {
                    props.onVolumeChange?.(isMuted() ? volume() / 100 : 0)
                  }
                  setIsMuted((s) => !s)
                }}
              />
              <input
                type={'range'}
                min={'0'}
                max={'100'}
                value={volume()}
                onInput={(e) => {
                  const value = parseInt(e.currentTarget.value)
                  props.onVolumeChange?.(value / 100)
                  setVolume(value)
                  setIsMuted(value === 0)
                }}
                class={'range range-xs w-24 ml-2'}
                classList={{
                  'range-primary': !isMuted(),
                }}
              />
            </div>
          </div>
          <div>
            <div>
              <span
                class={'iconify cursor-pointer'}
                classList={{
                  'ph--arrows-out-bold': !props.isFullscreen,
                  'ph--arrows-in-bold': props.isFullscreen,
                }}
                onClick={() => {
                  props.onFullscreen?.(!props.isFullscreen)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
