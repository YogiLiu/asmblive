import {
  Component,
  createResource,
  createSignal,
  For,
  JSX,
  Show,
} from 'solid-js'
import { useParams } from '@solidjs/router'
import RoomList from '../components/board/RoomList'
import { getBoard, updateBoard } from '../service/board'
import { Room } from '../service/types'
import Player from '../components/board/Player'
import Empty from '../components/Empty'

const Board: Component = () => {
  const id = useParams().id
  const [board, { mutate }] = createResource(() => getBoard(id))
  const handleAdd = async (room: Room) => {
    for (const r of board()!.rooms) {
      if (r.id === room.id && r.platformId === room.platform.id) {
        return
      }
    }
    const br = {
      id: room.id,
      platformId: room.platform.id,
      avatarUrl: room.owner.avatarUrl,
    }
    const newBoard = await updateBoard({
      ...board()!,
      rooms: [...board()!.rooms, br],
    })
    if (newBoard.id === board()!.id) {
      mutate((pre) => {
        if (!pre) {
          return newBoard
        }
        return {
          ...pre,
          rooms: [...pre.rooms, br],
        }
      })
    }
  }
  const handleRemove = async (room: Room) => {
    const newBoard = await updateBoard({
      ...board()!,
      rooms: board()!.rooms.filter(
        (r) => r.id !== room.id || r.platformId !== room.platform.id,
      ),
    })
    if (newBoard.id === board()!.id) {
      mutate((pre) => {
        if (!pre) {
          return newBoard
        }
        return {
          ...pre,
          rooms: pre.rooms.filter(
            (r) => r.id !== room.id || r.platformId !== room.platform.id,
          ),
        }
      })
    }
  }
  const [isEditingName, setIsEditingName] = createSignal(false)
  const handleSubmit: JSX.EventHandler<HTMLFormElement, SubmitEvent> = async (
    event,
  ) => {
    event.preventDefault()
    setIsEditingName(false)
    const data = new FormData(event.currentTarget)
    const name = data.get('name') as string
    if (!name || name === board()!.name) {
      return
    }
    const newBoard = await updateBoard({
      ...board()!,
      name: name,
    })
    if (newBoard.id === board()!.id) {
      mutate((pre) => {
        if (!pre) {
          return newBoard
        }
        return {
          ...pre,
          name: name,
        }
      })
    }
  }
  const handleEscape: JSX.EventHandler<HTMLFormElement, KeyboardEvent> = (
    event,
  ) => {
    if (event.key === 'Escape') {
      setIsEditingName(false)
    }
  }
  const [selectedRooms, setSelectedRooms] = createSignal<Room[]>([])
  const handleSelect = (room: Room) => {
    setSelectedRooms((pre) => {
      if (
        pre.find((r) => r.id === room.id && r.platform.id === room.platform.id)
      ) {
        return pre.filter(
          (r) => r.id !== room.id || r.platform.id !== room.platform.id,
        )
      }
      return [...pre, room]
    })
  }
  return (
    <Show when={board()}>
      <RoomList
        rooms={board()!.rooms}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onSelect={handleSelect}
        onUnselect={handleSelect}
      />
      <div class={'m-1 ml-20'}>
        <label
          class={'font-bold text-xl w-fit block my-5'}
          onClick={() => setIsEditingName(true)}
        >
          <Show
            when={isEditingName()}
            fallback={<Title name={board()!.name} />}
          >
            <form
              onSubmit={handleSubmit}
              class={
                'outline outline-offset-4 outline-2 rounded overflow-hidden w-fit flex items-center'
              }
              onKeyPress={handleEscape}
            >
              <input
                class={'outline-none'}
                name={'name'}
                value={board()!.name}
                minLength={1}
                maxLength={16}
                autofocus={true}
                placeholder={'Board Name'}
              />
              <span class={'iconify ph--arrow-elbow-down-left text-neutral '} />
            </form>
          </Show>
        </label>
        <div
          class={
            'w-full h-[calc(100vh-4.5rem)] overflow-auto grid auto-rows-min content-start gap-2'
          }
          classList={{
            'grid-cols-1': selectedRooms().length <= 1,
            'grid-cols-2': selectedRooms().length > 1,
          }}
        >
          <For each={selectedRooms()} fallback={<Empty />}>
            {(room) => <Player room={room} />}
          </For>
        </div>
      </div>
    </Show>
  )
}

export default Board

const Title: Component<{ name: string }> = (props) => {
  return (
    <div class={'w-fit flex items-center cursor-pointer'}>
      {props.name}
      <span class={'iconify ph--note-pencil ml-2 text-base-300'} />
    </div>
  )
}
