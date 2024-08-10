import { Component, createSignal, onMount, Show, Suspense } from 'solid-js'
import { Room } from '../../../service/types'
import Loading from './Loading'
import Offline from './Offline'
import Video from './Video'
import { usePlayerMeta } from './playerMeta'

type Props = {
  room: Room
}

const PlayerWrapper: Component<Props> = (props) => {
  const playerMeta = usePlayerMeta()
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
        <Show when={props.room.isOnline} fallback={<Offline />}>
          <Show when={playerMeta.selectedQuality()}>
            <Show when={playerMeta.selectedLiveUrl()}>
              <Video poster={props.room.coverUrl} />
            </Show>
          </Show>
        </Show>
        <Show when={props.room}>
          <div
            class={
              'absolute top-0 left-0 !h-fit bg-gradient-to-t from-transparent to-zinc-800 text-zinc-50 pb-6 pt-2 px-2 flex items-center gap-2'
            }
            classList={{
              hidden: !showInfo(),
              block: showInfo(),
            }}
          >
            <div class={'avatar'}>
              <div class={'w-10 rounded-full relative'}>
                <img src={props.room.owner.avatarUrl} alt={'avatar'} />
              </div>
              <img
                class={
                  'absolute bottom-0 right-0 !w-5 !h-5 rounded-full bg-zinc-50 p-1'
                }
                src={props.room.platform.iconUrl}
                alt={'platform'}
              />
            </div>
            <div class={'font-bold'}>{props.room.owner.name}</div>
          </div>
        </Show>
      </Suspense>
    </div>
  )
}

export default PlayerWrapper
