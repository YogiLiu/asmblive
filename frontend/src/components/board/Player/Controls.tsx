import { Component, createSignal, onCleanup, onMount } from 'solid-js'

type Props = {
  onVolumeChange?: (volume: number) => void
  isFullscreen: boolean
  onFullscreen?: (status: boolean) => void
}

const Controls: Component<Props> = (props) => {
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

export default Controls
