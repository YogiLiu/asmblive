import { cache, createAsync } from '@solidjs/router'
import { Component, createSignal, onMount, Show, Suspense } from 'solid-js'
import { Portal } from 'solid-js/web'
import Loading from './Loading'
import Form from './Form'
import Result from './Result'
import { getRoom } from '../../service/platform'
import { Room } from '../../service/types'

const cachedGetRoom = cache(
  (pid: string, rid: string) => getRoom(pid, rid),
  'GetRoom',
)

const RoomSelector: Component<{
  onSelect: (room: Room | null) => void
  show: boolean
}> = (props) => {
  onMount(() => {
    document.addEventListener('keyup', (event) => {
      if (event.key === 'Escape' && props.show) {
        props.onSelect(null)
      }
    })
  })
  const [args, setArgs] = createSignal<[string, string]>(['', ''])
  const room = createAsync(
    () => {
      if (args().some((a) => !a)) {
        return Promise.resolve(null)
      }
      return cachedGetRoom(...args())
    },
    {
      initialValue: null,
    },
  )
  return (
    <Portal>
      <Show when={props.show}>
        <div
          onClick={() => props.onSelect(null)}
          class={
            'absolute top-0 left-0 w-screen h-screen bg-zinc-500 bg-opacity-60'
          }
        >
          <div
            onClick={(e) => e.stopPropagation()}
            class={
              'p-6 rounded-box bg-base-100 w-2/3 max-w-[1024px] min-w-[768px] mx-auto mt-36'
            }
          >
            <Suspense>
              <Form onSubmit={setArgs} />
            </Suspense>
            <Suspense fallback={<Loading />}>
              <Result room={room()} onSelect={props.onSelect} />
            </Suspense>
          </div>
        </div>
      </Show>
    </Portal>
  )
}

export default RoomSelector
