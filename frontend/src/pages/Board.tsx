import {
  Component,
  createSignal,
  For,
  JSX,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { useRoomGetter } from '../hooks/roomGetter'
import { service } from 'wails/go/models'
import { A } from '@solidjs/router'
import Owner from '../components/Owner'
import { GetRoom } from 'wails/go/service/PlatformService'

const Board: Component = () => {
  return (
    <>
      <RoomList />
      <div class={'m-1 ml-20'}>123</div>
    </>
  )
}

export default Board

const RoomList: Component = () => {
  const [rooms, setRooms] = createSignal<service.RoomDto[]>([])
  const [roomGetter, setShow] = useRoomGetter((room) => {
    const ids = rooms().map((r) => r.id)
    if (!ids.includes(room.id)) {
      setRooms((rooms) => [...rooms, room])
    }
  })
  const deleteHandler = (room: service.RoomDto) =>
    setRooms((rooms) => rooms.filter((r) => r.id !== room.id))
  return (
    <div class={'p-1 absolute top-0 left-0'}>
      <div class={'p-1'} title={'返回'}>
        <A href={'/'} class={'btn'}>
          <span class={'iconify ph--arrow-bend-up-left'}> </span>
        </A>
      </div>
      <span class={'px-1 divider my-0'} />
      <Show when={rooms().length}>
        <div
          class={
            'max-h-[calc(100vh-152px)] overflow-y-scroll flex flex-col gap-2'
          }
        >
          <For each={rooms()}>
            {(room) => (
              <button
                disabled={!room.isOnline}
                class={'p-1 cursor-pointer'}
                title={room.owner!.name}
              >
                <RoomBtn room={room} onDelete={deleteHandler} />
              </button>
            )}
          </For>
        </div>
        <span class={'px-1 divider my-0'} />
      </Show>
      <div class={'p-1'} title={'添加直播'}>
        <button onClick={setShow} class={'btn outline-none'}>
          <span class={'iconify ph--plus-bold'}> </span>
        </button>
      </div>
      {roomGetter}
    </div>
  )
}

const minTimeout = 30000 // 30 seconds
const maxTimeout = 60000 // 60 seconds

function getRandomRefetchTimeout(): number {
  return Math.floor(Math.random() * (maxTimeout - minTimeout + 1)) + minTimeout
}

const RoomBtn: Component<{
  room: service.RoomDto
  onDelete?: (room: service.RoomDto) => void
}> = (props) => {
  const [room, setRoom] = createSignal<service.RoomDto>()
  onMount(() => {
    setRoom(props.room)
    let timer: number
    function refetch() {
      // @ts-expect-error TS2322
      timer = setTimeout(refetch, getRandomRefetchTimeout())
      GetRoom(props.room.platform!.id, props.room.id).then(
        (r) => r && setRoom(r),
      )
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
      props.onDelete?.(props.room)
    }
    setDragStartX(0)
    setIsDragging(false)
  }
  return (
    <Show when={room()}>
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
    </Show>
  )
}
