import { Component, createSignal, For, JSX } from 'solid-js'
import { createAsync } from '@solidjs/router'
import { getPlatforms } from '../../service/platform'

const Form: Component<{ onSubmit: (args: [string, string]) => void }> = (
  props,
) => {
  const platforms = createAsync(getPlatforms, { initialValue: [] })
  const submitHandler: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (
    event,
  ) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const pid = (data.get('platformId') as string) || ''
    const rid = (data.get('roomId') as string) || ''
    if (pid && rid) {
      props.onSubmit([pid, rid])
    }
  }
  const [tab, setTab] = createSignal(0)
  return (
    <div class={'tabs tabs-lifted'} role={'tablist'}>
      <For each={platforms()}>
        {(platform, idx) => (
          <>
            <button
              role={'tab'}
              class={'tab'}
              onClick={() => setTab(idx())}
              classList={{ 'tab-active': tab() === idx() }}
              title={platform.name}
            >
              <img
                class={'w-4 h-4'}
                src={platform.iconUrl}
                alt={platform.name}
              />
            </button>
            {/* Must place 'col-span-10' class in here, otherwise the width cannot fill the parent in webview,
             it assumes  the number of platforms less as 9, if not, please set correct value. */}
            <div
              role={'tabpanel'}
              class={
                'tab-content rounded-lg border border-base-300 px-4 py-2 col-span-10'
              }
            >
              <form class={'flex'} onSubmit={submitHandler}>
                <input
                  type={'hidden'}
                  name={'platformId'}
                  value={platform.id}
                />
                <input
                  name={'roomId'}
                  type={'text'}
                  class={'outline-none flex-grow bg-transparent'}
                  placeholder={`请输入${platform.name}房间号`}
                  maxLength={32}
                  autofocus={true}
                />
                <button type={'submit'} class={'btn btn-sm btn-primary'}>
                  <span class={'iconify ph--magnifying-glass'} />
                </button>
              </form>
            </div>
          </>
        )}
      </For>
    </div>
  )
}

export default Form
