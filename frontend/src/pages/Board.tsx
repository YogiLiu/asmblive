import { Component, createResource, createSignal, JSX, Show } from 'solid-js'
import { service } from 'wails/go/models'
import { useParams } from '@solidjs/router'
import { GetBoard, UpdateBoard } from 'wails/go/service/BoardService'
import RoomList from '../components/board/RoomList'

const Board: Component = () => {
  const id = useParams().id
  const [board, { refetch }] = createResource(() => GetBoard(id))
  const handleAdd = async (room: service.RoomDto) => {
    board()!.rooms.forEach((r) => {
      if (r.id === room.id && r.platformId === room.platform.id) {
        return
      }
    })
    await UpdateBoard(
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
    refetch()
  }
  const handleRemove = async (room: service.RoomDto) => {
    await UpdateBoard(
      new service.BoardDTO({
        ...board()!,
        rooms: board()!.rooms.filter(
          (r) => r.id !== room.id || r.platformId !== room.platform.id,
        ),
      }),
    )
    refetch()
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
    await UpdateBoard(
      new service.BoardDTO({
        ...board()!,
        name: name,
      }),
    )
    refetch()
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
          class={'font-bold text-xl pt-4 w-fit block'}
          onClick={() => setIsEditingName(true)}
        >
          <Show
            when={isEditingName()}
            fallback={<div class={'h-8 w-fit'}>{board()!.name}</div>}
          >
            <form
              onSubmit={handleSubmit}
              class={
                'outline outline-offset-2 outline-2 px-2 rounded overflow-hidden w-fit flex items-center'
              }
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
      </div>
    </Show>
  )
}

export default Board
