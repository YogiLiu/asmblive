import {
  Component,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from 'solid-js'
import { useRoomGetter } from '../hooks/roomGetter'
import { service } from 'wails/go/models'
import { A } from '@solidjs/router'
import Owner from '../components/Owner'
import { GetRoom } from 'wails/go/service/Service'

const Board: Component = () => {
  return (
    <>
      <RoomList />
      <div class={'m-1 ml-20'}>123</div>
    </>
  )
}

export default Board

const minTimeout = 10000
const maxTimeout = 60000

function getRandomRefetchTimeout(): number {
  return Math.floor(Math.random() * (maxTimeout - minTimeout + 1)) + minTimeout
}

const RoomBtn: Component<{ room: service.RoomDto }> = (props) => {
  const [room, setRoom] = createSignal<service.RoomDto>()
  onMount(() => {
    setRoom(props.room)
    let timer: number
    function refetch() {
      // @ts-expect-error TS2322
      timer = setTimeout(refetch, getRandomRefetchTimeout())
      GetRoom(props.room.platform!.id, props.room.id)
        .then((r) => {
          console.log(r)
          return r
        })
        .then((r) => r && setRoom(r))
    }
    // @ts-expect-error TS2322
    timer = setTimeout(refetch, getRandomRefetchTimeout())
    onCleanup(() => clearTimeout(timer))
  })
  return (
    <Show when={room()}>
      <Owner room={room()!} />
    </Show>
  )
}

const RoomList: Component = () => {
  const [rooms, setRooms] = createSignal<service.RoomDto[]>([])
  const [roomGetter, setShow] = useRoomGetter((room) => {
    const ids = rooms().map((r) => r.id)
    if (!ids.includes(room.id)) {
      setRooms((rooms) => [...rooms, room])
    }
  })
  return (
    <div class={'p-1 absolute top-0 left-0'}>
      <div class={'p-1'}>
        <A href={'/'} onClick={setShow} class={'btn btn-secondary-content'}>
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
              <button disabled={!room.isOnline} class={'p-1'}>
                <RoomBtn room={room} />
              </button>
            )}
          </For>
        </div>
        <span class={'px-1 divider my-0'} />
      </Show>
      <div class={'p-1'}>
        <button onClick={setShow} class={'btn btn-secondary-content'}>
          <span class={'iconify ph--plus-bold'}> </span>
        </button>
      </div>
      {roomGetter}
    </div>
  )
}
