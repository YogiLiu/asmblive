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
  onSelect?: (room: Room) => void
  onUnselect?: (room: Room) => void
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
  const [isSelect, setIsSelect] = createSignal(false)
  const handleSelect = () => {
    if (isSelect()) {
      props.onUnselect?.(room()!)
    } else {
      props.onSelect?.(room()!)
    }
    setIsSelect((s) => !s)
  }
  return (
    <Show
      when={room()}
      fallback={<PlaceHolder avatarUrl={props.room.avatarUrl} />}
    >
      <button
        class={'p-1 cursor-pointer'}
        title={room()!.owner.name}
        onClick={handleSelect}
      >
        <div
          class={'relative'}
          draggable={true}
          onDragStart={dragStartHandler}
          onDragEnd={dragEndHandler}
        >
          <Owner room={room()!} />
          <Show when={isSelect()}>
            <div
              class={
                'absolute top-0 left-0 w-full h-full bg-base-300 bg-opacity-40 flex justify-center items-center'
              }
            >
              <PlayingIcon />
            </div>
          </Show>
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

const PlayingIcon: Component = () => {
  return (
    <svg
      xmlns={'http://www.w3.org/2000/svg'}
      viewBox={'0 0 30 30'}
      class={'fill-success w-4 h-4'}
    >
      <rect x={0} y={30} height={30} width={10}>
        <animate
          attributeName={'y'}
          values={'30;0;30'}
          keyTimes={'0;0.5;1'}
          dur={'0.6s'}
          repeatCount={'indefinite'}
        />
      </rect>
      <rect x={10} y={30} height={30} width={10}>
        <animate
          attributeName={'y'}
          values={'30;0;30'}
          keyTimes={'0;0.5;1'}
          dur={'0.6s'}
          begin={'0.2s'}
          repeatCount={'indefinite'}
        />
      </rect>
      <rect x={20} y={30} height={30} width={10}>
        <animate
          attributeName={'y'}
          values={'30;0;30'}
          keyTimes={'0;0.5;1'}
          dur={'0.6s'}
          begin={'0.4s'}
          repeatCount={'indefinite'}
        />
      </rect>
    </svg>
  )
}
