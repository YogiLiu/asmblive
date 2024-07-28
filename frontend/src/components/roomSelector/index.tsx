import { cache, createAsync } from '@solidjs/router'
import { GetRoom } from 'wails/go/service/PlatformService'
import { Component, createSignal, onMount, Show, Suspense } from 'solid-js'
import { service } from 'wails/go/models'
import { Portal } from 'solid-js/web'
import Loading from './Loading'
import Form from './Form'
import Result from './Result'

const cachedGetRoom = cache(
  (pid: string, rid: string) => GetRoom(pid, rid),
  'GetRoom',
)

const RoomSelector: Component<{
  onSelect: (room: service.RoomDto | null) => void
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
              'p-6 rounded-box bg-base-100 w-2/3 max-w-[1024px] mx-auto mt-36'
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
