import { service } from 'wails/go/models'
import { Component, For, Show } from 'solid-js'
import { useRoomSelector } from '../../hooks/roomSelector'
import { A } from '@solidjs/router'
import RoomBtn from './RoomBtn'

type Props = {
  rooms: service.BoardRoomDTO[]
  onAdd: (room: service.RoomDto) => void
  onRemove: (room: service.RoomDto) => void
}

const RoomList: Component<Props> = (props) => {
  const [roomGetter, setShow] = useRoomSelector((room) => {
    props.onAdd(room)
  })
  const deleteHandler = (room: service.RoomDto) => props.onRemove(room)
  return (
    <div class={'p-1 absolute top-0 left-0'}>
      <div class={'p-1'} title={'返回'}>
        <A href={'/'} class={'btn'}>
          <span class={'iconify ph--arrow-bend-up-left'}> </span>
        </A>
      </div>
      <span class={'px-1 divider my-0'} />
      <Show when={props.rooms.length}>
        <div
          class={
            'max-h-[calc(100vh-152px)] overflow-y-scroll flex flex-col gap-2'
          }
        >
          <For each={props.rooms}>
            {(room) => <RoomBtn room={room} onDelete={deleteHandler} />}
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

export default RoomList