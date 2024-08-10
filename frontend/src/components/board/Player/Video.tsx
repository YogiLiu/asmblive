import {
  Component,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import Hls from 'hls.js'
import Controls from './Controls'
import Loading from './Loading'
import { usePlayerMeta } from './playerMeta'

type Props = {
  poster?: string
}

const Video: Component<Props> = (props) => {
  const playerMeta = usePlayerMeta()
  let wrapperRef: HTMLDivElement
  let videoRef: HTMLVideoElement
  onMount(() => {
    videoRef.addEventListener('canplay', () => {
      playerMeta.setVideoInfo((pre) => {
        return {
          ...pre,
          width: videoRef.videoWidth,
          height: videoRef.videoHeight,
        }
      })
    })
    videoRef.addEventListener('loadstart', () => {
      playerMeta.setVideoInfo(null)
    })
  })
  createEffect(() => {
    if (!videoRef) {
      return
    }
    // TODO: should have a better way to check the url is m3u8 or not
    if (!playerMeta.selectedLiveUrl()!.url.includes('m3u8')) {
      videoRef.src = playerMeta.selectedLiveUrl()!.url
      return
    }
    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(playerMeta.selectedLiveUrl()!.url)
      hls.attachMedia(videoRef)
      onCleanup(() => hls.destroy())
    } else if (videoRef.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.src = playerMeta.selectedLiveUrl()!.url
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
        onLoadStart={() => setIsLoading(true)}
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

export default Video
