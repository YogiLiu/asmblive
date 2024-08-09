import { Quality } from '../../../service/types'
import { Component, createSignal, onCleanup, onMount, Show } from 'solid-js'
import Hls from 'hls.js'
import Controls from './Controls'
import Loading from './Loading'

type Props = {
  url: string
  poster?: string
  qualities: Quality[]
}

const Video: Component<Props> = (props) => {
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

export default Video
