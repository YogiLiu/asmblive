import { Component, createSignal, For, Show } from 'solid-js'
import { A } from '@solidjs/router'
import RoomBtn from './RoomBtn'
import { BoardRoom, Room } from '../../service/types'
import RoomSelector from '../RoomSelector'

type Props = {
  rooms: BoardRoom[]
  onAdd: (room: Room) => void
  onRemove: (room: Room) => void
  onSelect?: (room: Room) => void
  onUnselect?: (room: Room) => void
}

const RoomList: Component<Props> = (props) => {
  const [show, setShow] = createSignal(false)
  const selectHandler = (room: Room | null) => {
    if (room !== null) {
      props.onAdd(room)
    }
    setShow(false)
  }
  const deleteHandler = (room: Room) => props.onRemove(room)
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
            'max-h-[calc(100vh-9.5rem)] overflow-y-scroll flex flex-col gap-2 noscrollbar'
          }
        >
          <For each={props.rooms}>
            {(room) => (
              <RoomBtn
                room={room}
                onDelete={deleteHandler}
                onSelect={props.onSelect}
                onUnselect={props.onUnselect}
              />
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
      <RoomSelector onSelect={selectHandler} show={show()} />
    </div>
  )
}

export default RoomList
