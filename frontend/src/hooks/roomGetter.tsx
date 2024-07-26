import { service } from 'wails/go/models'
import {
  Component,
  createSignal,
  For,
  JSX,
  onMount,
  Show,
  Suspense,
} from 'solid-js'
import { Portal } from 'solid-js/web'
import { cache, createAsync } from '@solidjs/router'
import { GetPlatforms, GetRoom } from 'wails/go/service/Service'

type OnSelect = (room: service.RoomDto) => void

export const useRoomGetter = (
  onSelect: OnSelect,
): [JSX.Element, () => void] => {
  const [show, setShow] = createSignal(false)
  const selectHandler = (room: service.RoomDto | null) => {
    if (room !== null) {
      onSelect(room)
    }
    setShow(false)
  }
  return [
    <RoomSelector onSelect={selectHandler} show={show()} />,
    () => setShow(true),
  ]
}

const cachedGetRoom = cache(
  (pid: string, rid: string): Promise<service.RoomDto | null> =>
    GetRoom(pid, rid),
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
  const room = createAsync(() => cachedGetRoom(...args()), {
    initialValue: null,
  })
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

const Form: Component<{ onSubmit: (args: [string, string]) => void }> = (
  props,
) => {
  const platforms = createAsync(GetPlatforms, { initialValue: [] })
  const submitHandler: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (
    event,
  ) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const pid = (data.get('platform') as string) || ''
    const rid = (data.get('roomId') as string) || ''
    if (pid && rid) {
      props.onSubmit([pid, rid])
    }
  }
  return (
    <form
      onSubmit={submitHandler}
      class={'flex rounded-box border border-primary overflow-hidden p-2'}
    >
      <select
        name={'platform'}
        class={'select border-none h-auto min-h-fit focus:outline-none'}
      >
        <For each={platforms()}>
          {(platform) => <option value={platform.id}>{platform.name}</option>}
        </For>
      </select>
      <input
        name={'roomId'}
        type={'text'}
        class={'outline-none flex-grow'}
        placeholder={'输入房间号'}
        maxLength={32}
        required={true}
        autofocus={true}
      />
      <button type={'submit'} class={'btn btn-sm btn-primary'}>
        <span class={'iconify ph--magnifying-glass'}></span>
      </button>
    </form>
  )
}

const Result: Component<{
  room: service.RoomDto | null
  onSelect: OnSelect
}> = (props) => {
  return (
    <div>
      <Show when={props.room} fallback={<Empty />}>
        <div
          onClick={() => props.onSelect(props.room!)}
          class={
            'mt-4 rounded-box overflow-hidden relative hover:outline outline-accent outline-offset-2'
          }
        >
          <img
            class={'w-full'}
            src={props.room!.coverUrl}
            alt={props.room!.title}
          />
          <div
            class={
              'absolute left-0 bottom-0 w-full p-2 bg-secondary-content bg-opacity-85 flex gap-2'
            }
          >
            <div class={'relative'}>
              {/* 直播状态 */}
              <Show when={props.room!.isOnline}>
                <span
                  class={
                    'animate-ping absolute top-0 right-0 h-2 w-2 rounded-full bg-success opacity-75'
                  }
                ></span>
                <span
                  class={
                    'absolute top-0 right-0 h-2 w-2 rounded-full bg-success'
                  }
                ></span>
              </Show>
              {/* 主播头像 */}
              <img
                class={'rounded-box border border-primary w-12 h-12'}
                src={props.room!.owner!.avatarUrl}
                alt={props.room!.owner!.name}
              />
              {/* 平台图标 */}
              <img
                class={
                  'absolute w-5 h-5 bottom-0 right-0 bg-base-200 rounded-full p-1'
                }
                src={props.room!.platform!.iconUrl}
                alt={props.room!.platform!.name}
              />
            </div>
            <div>
              <div class={'font-bold text-lg'}>{props.room!.title}</div>
              <div class={'text-md'}>{props.room!.owner!.name}</div>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

const Empty: Component = () => {
  return (
    <div class={'w-full text-center py-8 text-neutral-content'}>
      <span class={'iconify ph--empty align-middle'}></span>
      <span class={'ml-2'}>空空如也</span>
    </div>
  )
}

const Loading: Component = () => {
  return (
    <div class={'w-full text-center py-8 text-neutral-content'}>
      <span class="loading loading-bars loading-md"></span>
    </div>
  )
}
