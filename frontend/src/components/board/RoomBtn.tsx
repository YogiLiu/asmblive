import {
  Component,
  createSignal,
  JSX,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import Owner from '../Owner'
import { BoardRoom, Room } from '../../service/types'
import { getRoom } from '../../service/platform'

const minTimeout = 30000 // 30 seconds
const maxTimeout = 60000 // 60 seconds

function getRandomRefetchTimeout(): number {
  return Math.floor(Math.random() * (maxTimeout - minTimeout + 1)) + minTimeout
}

type Props = {
  room: BoardRoom
  onDelete?: (room: Room) => void
}

const RoomBtn: Component<Props> = (props) => {
  const [room, setRoom] = createSignal<Room>()
  onMount(() => {
    getRoom(props.room.platformId, props.room.id).then((r) => r && setRoom(r))
    let timer: number
    function refetch() {
      // @ts-expect-error TS2322
      timer = setTimeout(refetch, getRandomRefetchTimeout())
      getRoom(props.room.platformId, props.room.id).then((r) => r && setRoom(r))
    }
    // @ts-expect-error TS2322
    timer = setTimeout(refetch, getRandomRefetchTimeout())
    onCleanup(() => clearTimeout(timer))
  })
  const [dragStartX, setDragStartX] = createSignal(0)
  const [isDragging, setIsDragging] = createSignal(false)
  const dragStartHandler: JSX.EventHandler<HTMLDivElement, DragEvent> = (
    event,
  ) => {
    setDragStartX(event.clientX)
    setIsDragging(true)
  }
  const deleteThreshold = 64
  const dragEndHandler: JSX.EventHandler<HTMLDivElement, DragEvent> = (
    event,
  ) => {
    if (Math.abs(event.clientX - dragStartX()) >= deleteThreshold) {
      props.onDelete?.(room()!)
    }
    setDragStartX(0)
    setIsDragging(false)
  }
  return (
    <Show
      when={room()}
      fallback={<PlaceHolder avatarUrl={props.room.avatarUrl} />}
    >
      <button
        disabled={!room()!.isOnline}
        class={'p-1 cursor-pointer'}
        title={room()!.owner.name}
      >
        <div
          class={'relative'}
          draggable={true}
          onDragStart={dragStartHandler}
          onDragEnd={dragEndHandler}
        >
          <Owner room={room()!} />
          <div class={'absolute top-0 right-0 w-full h-full overflow-hidden'}>
            <div
              class={
                'w-full h-full bg-base-300 bg-opacity-70 flex justify-center items-center rounded-box transition-all'
              }
              classList={{
                '-translate-x-full': !isDragging(),
                'translate-x-0': isDragging(),
              }}
            >
              <span class={'iconify ph--trash-bold text-xl text-error'} />
            </div>
          </div>
        </div>
      </button>
    </Show>
  )
}

export default RoomBtn

const PlaceHolder: Component<{ avatarUrl: string }> = (props) => {
  return (
    <div class={'p-1'}>
      <div class={'rounded-box overflow-hidden h-12 w-12 relative'}>
        <img class={'w-full h-full'} src={props.avatarUrl} alt={'Avatar'} />
        <div
          class={
            'absolute top-0 left-0 w-full h-full flex justify-center items-center bg-base-300 bg-opacity-50'
          }
        >
          <span class={'loading loading-bars loading-xs'} />
        </div>
      </div>
    </div>
  )
}
