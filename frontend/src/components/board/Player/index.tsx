import {
  Component,
  createEffect,
  createSignal,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import { Quality, Room } from '../../../service/types'
import { createAsync } from '@solidjs/router'
import Loading from './Loading'
import Offline from './Offline'
import Video from './Video'
import {
  cachedGetLiveUrls,
  cachedGetQualities,
  cachedGetRoom,
} from './cacheService'

type Props = {
  room: Room
}

const Index: Component<Props> = (props) => {
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
              <Video
                url={selectLiveUrl()!}
                poster={room()!.coverUrl}
                qualities={qualities()!}
              />
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

export default Index
