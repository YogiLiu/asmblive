import { Component, createResource, For, Index, Show } from 'solid-js'
import { A, createAsync } from '@solidjs/router'
import { AddBoard, GetBoards, RemoveBoard } from 'wails/go/service/BoardService'
import { service } from 'wails/go/models'
import { nanoid } from 'nanoid'
import { GetVersion } from 'wails/go/main/version'

const Home: Component = () => {
  const [boards, { mutate }] = createResource(GetBoards, {
    initialValue: [],
  })
  const handleAdd = async () => {
    const boards = await AddBoard(
      new service.BoardDTO({
        id: nanoid(),
        name: '未命名看板',
        rooms: [],
      }),
    )
    mutate(boards)
  }
  const handleRemove = async (board: service.BoardDTO) => {
    const b = await RemoveBoard(board.id)
    if (b.id === board.id) {
      mutate((boards) => boards.filter((item) => item.id !== board.id))
    }
  }
  const version = createAsync(GetVersion, { initialValue: '' })
  return (
    <div class={'h-screen overflow-scroll flex flex-col'}>
      <div
        class={
          'flex-grow m-6 *:w-24 *:h-24 flex gap-4 flex-wrap justify-around after:flex-auto content-start'
        }
      >
        <Show when={boards()}>
          <For each={boards()}>
            {(board) => (
              <div class={'relative group'}>
                <Board board={board} />
                <button
                  onClick={() => handleRemove(board)}
                  class={
                    'absolute hidden top-0 right-0 rounded-full bg-error group-hover:flex justify-center items-center p-1 translate-x-2 -translate-y-2 hover:rotate-90 transition-all outline outline-base-100'
                  }
                >
                  <span class={'iconify ph--x-bold text-xs text-zinc-50'} />
                </button>
              </div>
            )}
          </For>
        </Show>
        <button
          onClick={handleAdd}
          class={
            'flex justify-center items-center hover:outline rounded-box border outline-offset-2 outline-accent'
          }
          title={'添加看板'}
        >
          <span class={'iconify ph--plus-bold text-2xl'}> </span>
        </button>
      </div>
      <div class={'text-center mb-1 text-sm font-light'}>v{version()}</div>
    </div>
  )
}

export default Home

const Board: Component<{ board: service.BoardDTO }> = (props) => {
  return (
    <A
      href={`/boards/${props.board.id}`}
      class={
        'w-full h-full hover:outline overflow-y-scroll rounded-box border outline-offset-2 outline-accent flex flex-wrap justify-between p-2 gap-1'
      }
      title={props.board.name}
    >
      <Index each={props.board.rooms} fallback={<NoRoom />}>
        {(room) => (
          <img
            class={'w-9 h-9 rounded border border-primary'}
            src={room().avatarUrl}
            alt={'room'}
          />
        )}
      </Index>
    </A>
  )
}

const NoRoom: Component = () => {
  return (
    <div class={'w-full h-full flex justify-center items-center'}>
      <span class={'iconify ph--folder-simple-dotted text-3xl text-base-300'} />
    </div>
  )
}
