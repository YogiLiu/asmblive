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
  return (
    <div
      class={
        'bg-accent-content rounded-box overflow-hidden aspect-video *:w-full *:h-full'
      }
    >
      <Suspense fallback={<Loading />}>
        <Show when={room()?.isOnline} fallback={<Offline />}>
          <Show when={selectedQuality()}>
            <Show when={selectLiveUrl()}>
              <Video url={selectLiveUrl()!} poster={room()!.coverUrl} />
            </Show>
          </Show>
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
  onRequestFullscreen?: () => void
  onExitFullscreen?: () => void
}

const Video: Component<VideoProps> = (props) => {
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
  return (
    <div class={'relative w-full h-full'}>
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
      <Controls onSwitchMuted={() => (videoRef.muted = !videoRef.muted)} />
    </div>
  )
}

type ControlsProps = {
  onSwitchMuted?: () => void
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
  return (
    <div class={'absolute w-full h-full top-0 left-0'} ref={ref!}>
      <div
        class={'relative w-full h-full text-base-300'}
        classList={{
          hidden: !open(),
          block: open(),
        }}
      >
        <div
          class={
            'absolute top-0 left-0 w-full p-2 bg-gradient-to-t from-transparent to-base-content'
          }
          onMouseEnter={() => setCanClose(false)}
          onMouseLeave={() => setCanClose(true)}
        />
        <div
          class={
            'absolute bottom-0 left-0 w-full p-2 bg-gradient-to-b from-transparent to-base-content *:cursor-pointer'
          }
          onMouseEnter={() => setCanClose(false)}
          onMouseLeave={() => setCanClose(true)}
        >
          <span
            class={'iconify ph--speaker-simple-high-bold'}
            onClick={() => props.onSwitchMuted?.()}
          />
        </div>
      </div>
    </div>
  )
}
