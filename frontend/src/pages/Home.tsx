import { Component, createResource, For, Index, Show } from 'solid-js'
import { A, createAsync } from '@solidjs/router'
import { Board as BoardType } from '../service/types'
import { addBoard, getBorders, removeBoard } from '../service/board'
import { getVersion } from '../service/version'

const Home: Component = () => {
  const [boards, { mutate }] = createResource(getBorders, {
    initialValue: [],
  })
  const handleAdd = async () => {
    const nb = await addBoard()
    mutate((boards) => [...boards, nb])
  }
  const handleRemove = async (board: BoardType) => {
    const b = await removeBoard(board.id)
    if (b.id === board.id) {
      mutate((boards) => boards.filter((item) => item.id !== b.id))
    }
  }
  const version = createAsync(() => getVersion().then((v) => 'v' + v), {
    initialValue: '',
  })
  return (
    <div class={'h-screen overflow-auto flex flex-col'}>
      <div
        class={
          'flex-grow m-6 *:w-24 *:h-24 grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] content-start gap-4'
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
                  <span class={'iconify ph--x-bold text-sm text-zinc-50'} />
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
        <A
          href={'/settings'}
          class={
            'flex justify-center items-center hover:outline rounded-box border outline-offset-2 outline-accent'
          }
          title={'设置'}
        >
          <span class={'iconify ph--gear text-2xl'}> </span>
        </A>
      </div>
      <div class={'text-center mb-1 text-sm font-light'}>{version()}</div>
    </div>
  )
}

export default Home

const Board: Component<{ board: BoardType }> = (props) => {
  return (
    <A
      href={`/boards/${props.board.id}`}
      class={
        'w-full h-full hover:outline overflow-y-scroll noscrollbar rounded-box border outline-offset-2 outline-accent flex flex-wrap justify-between p-2 gap-1'
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
