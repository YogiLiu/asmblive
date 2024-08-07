import { Component, onCleanup, onMount } from 'solid-js'
import Hls from 'hls.js'

type Props = {
  url: string
  poster?: string
  onRequestFullscreen?: () => void
  onExitFullscreen?: () => void
}

const Video: Component<Props> = (props) => {
  let videoRef: HTMLVideoElement
  onMount(() => {
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
  return (
    <video
      class={'w-full h-full'}
      controls={true}
      muted={true}
      autoplay={true}
      poster={props.poster}
      ref={videoRef!}
    />
  )
}

export default Video
