import { Component, createResource, createSignal, JSX, Show } from 'solid-js'
import { service } from 'wails/go/models'
import { useParams } from '@solidjs/router'
import { GetBoard, UpdateBoard } from 'wails/go/service/BoardService'
import RoomList from '../components/board/RoomList'

const Board: Component = () => {
  const id = useParams().id
  const [board, { mutate }] = createResource(() => GetBoard(id))
  const handleAdd = async (room: service.RoomDto) => {
    for (const r of board()!.rooms) {
      if (r.id === room.id && r.platformId === room.platform.id) {
        return
      }
    }
    const newBoard = await UpdateBoard(
      new service.BoardDTO({
        ...board()!,
        rooms: [
          ...board()!.rooms,
          new service.BoardRoomDTO({
            id: room.id,
            platformId: room.platform.id,
            avatarUrl: room.owner.avatarUrl,
          }),
        ],
      }),
    )
    if (newBoard.id === board()!.id) {
      mutate(newBoard)
    }
  }
  const handleRemove = async (room: service.RoomDto) => {
    const newBoard = await UpdateBoard(
      new service.BoardDTO({
        ...board()!,
        rooms: board()!.rooms.filter(
          (r) => r.id !== room.id || r.platformId !== room.platform.id,
        ),
      }),
    )
    if (newBoard.id === board()!.id) {
      mutate(newBoard)
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
    const newBoard = await UpdateBoard(
      new service.BoardDTO({
        ...board()!,
        name: name,
      }),
    )
    if (newBoard.id === board()!.id) {
      mutate(newBoard)
    }
  }
  const handleEscape: JSX.EventHandler<HTMLFormElement, KeyboardEvent> = (
    event,
  ) => {
    if (event.key === 'Escape') {
      setIsEditingName(false)
    }
  }
  return (
    <Show when={board()}>
      <RoomList
        rooms={board()!.rooms}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
      <div class={'m-1 ml-20'}>
        <label
          class={'font-bold text-xl w-fit block my-5'}
          onClick={() => setIsEditingName(true)}
        >
          <Show
            when={isEditingName()}
            fallback={<div class={'w-fit'}>{board()!.name}</div>}
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
            'w-full h-[calc(100vh-4.5rem)] overflow-scroll border rounded-box'
          }
        >
          123
        </div>
      </div>
    </Show>
  )
}

export default Board
