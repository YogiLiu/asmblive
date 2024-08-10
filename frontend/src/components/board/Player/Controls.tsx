import {
  Component,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { usePlayerMeta } from './playerMeta'

type Props = {
  onVolumeChange?: (volume: number) => void
  isFullscreen: boolean
  onFullscreen?: (status: boolean) => void
}

const Controls: Component<Props> = (props) => {
  const playerMeta = usePlayerMeta()
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
  const [showInfo, setShowInfo] = createSignal(false)
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
        <Show when={playerMeta.videoInfo() && showInfo()}>
          <div class={'w-full h-full flex justify-center items-center'}>
            <div
              class={
                'rounded-box px-4 py-2 bg-zinc-800 text-zinc-50 bg-opacity-90 flex flex-col gap-1'
              }
            >
              <span class={'font-bold'}>视频信息</span>
              <span>宽度：{playerMeta.videoInfo()!.width}</span>
              <span>高度：{playerMeta.videoInfo()!.height}</span>
            </div>
          </div>
        </Show>
        <div
          class={
            'absolute bottom-0 left-0 w-full p-4 bg-gradient-to-b from-transparent to-zinc-800 text-zinc-50 flex justify-between'
          }
          onMouseEnter={() => setCanClose(false)}
          onMouseLeave={() => setCanClose(true)}
        >
          <div class={'flex-grow'}>
            <div class={'flex items-center'}>
              <span
                class={'iconify cursor-pointer text-xl'}
                classList={{
                  'ph--speaker-simple-high-bold': !isMuted() && volume() >= 0.5,
                  'ph--speaker-simple-low-bold': !isMuted() && volume() < 0.5,
                  'ph--speaker-simple-x-bold': isMuted(),
                }}
                onClick={() => {
                  if (volume() === 0) {
                    props.onVolumeChange?.(isMuted() ? 0.6 : 0)
                    setVolume(0.6)
                  } else {
                    props.onVolumeChange?.(isMuted() ? volume() : 0)
                  }
                  setIsMuted((s) => !s)
                }}
              />
              <input
                type={'range'}
                min={0}
                max={100}
                value={volume() * 100}
                onInput={(e) => {
                  const value = parseInt(e.currentTarget.value) / 100
                  props.onVolumeChange?.(value)
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
          <div class={'flex gap-2 items-center'}>
            <span
              class={'iconify ph--info-bold text-xl cursor-pointer'}
              classList={{
                inline: !!playerMeta.videoInfo(),
                hidden: !playerMeta.videoInfo(),
              }}
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            />
            <Menu
              items={playerMeta
                .liveUrls()
                .map((u) => ({ id: u.url, name: u.name }))}
              selectedId={playerMeta.selectedLiveUrl()?.url}
              onSelect={(url) => {
                playerMeta.setSelectedLiveUrl(
                  playerMeta.liveUrls().find((u) => u.url === url) || null,
                )
              }}
            />
            <Menu
              items={playerMeta
                .qualities()
                .map((q) => ({ id: q.id, name: q.name }))}
              selectedId={playerMeta.selectedQuality()?.id}
              onSelect={(q) => {
                playerMeta.setSelectedQualityId(
                  playerMeta.qualities().find((u) => u.id === q)?.id || null,
                )
              }}
            />
            <span
              class={'iconify cursor-pointer text-xl'}
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
  )
}

export default Controls

type MenuProps = {
  items: { id: string | number; name: string }[]
  selectedId: string | number | undefined
  onSelect?: (id: string | number) => void
}

const Menu: Component<MenuProps> = (props) => {
  const selectedName = createMemo(() => {
    return props.items.find((i) => i.id === props.selectedId)?.name
  })
  return (
    <Show when={props.items.length}>
      <div class={'relative group w-16 text-center text-sm'}>
        <span class={'cursor-pointer font-bold'}>{selectedName()}</span>
        <div
          class={
            'absolute left-0 -top-32 h-32 overflow-auto noscrollbar w-16 hidden group-hover:flex flex-col gap-2 bg-zinc-800 text-zinc-50 bg-opacity-90 rounded p-2'
          }
        >
          <For each={props.items}>
            {(item) => (
              <span
                class={'cursor-pointer'}
                classList={{
                  'text-secondary': item.id === props.selectedId,
                  'hover:text-accent': item.id !== props.selectedId,
                }}
                onClick={() => {
                  props.onSelect?.(item.id)
                }}
              >
                {item.name}
              </span>
            )}
          </For>
        </div>
      </div>
    </Show>
  )
}
