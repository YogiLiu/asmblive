import { Component, createEffect, createSignal, Show, Suspense } from 'solid-js'
import { Quality, Room } from '../../service/types'
import { cache, createAsync } from '@solidjs/router'
import { getLiveUrls, getQualities, getRoom } from '../../service/platform'
import Video from './Video'

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
        'bg-accent-content rounded-md overflow-hidden aspect-w-16 aspect-h-9 relative group'
      }
    >
      <Suspense fallback={<Loading />}>
        <Show when={room()?.isOnline} fallback={<Offline />}>
          <Show when={selectedQuality()} fallback={<div>no qualities</div>}>
            <Show when={selectLiveUrl()} fallback={<div>no urls</div>}>
              <div>
                <Video url={selectLiveUrl()!} poster={room()!.coverUrl} />
              </div>
            </Show>
          </Show>
        </Show>
      </Suspense>
    </div>
  )
}

export default Player

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

const Loading: Component = () => {
  return (
    <div class={'flex justify-center items-center text-neutral-content'}>
      <span class={'loading loading-bars loading-md'} />
    </div>
  )
}
