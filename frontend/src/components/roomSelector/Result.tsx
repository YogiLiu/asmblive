import { Component, Show } from 'solid-js'
import { service } from 'wails/go/models'
import Owner from '../Owner'
import Empty from './Empty'

type OnSelect = (room: service.RoomDto) => void

const Result: Component<{
  room: service.RoomDto | null
  onSelect: OnSelect
}> = (props) => {
  return (
    <Show when={props.room} fallback={<Empty />}>
      <div
        onClick={() => props.onSelect(props.room!)}
        class={
          'mt-4 rounded-box overflow-hidden relative hover:outline outline-accent outline-offset-2 cursor-pointer'
        }
      >
        <div class={'w-full aspect-w-16 aspect-h-9'}>
          <img
            class={'w-full h-full'}
            src={props.room!.coverUrl}
            alt={props.room!.title}
          />
        </div>
        <div
          class={
            'absolute left-0 bottom-0 w-full p-2 bg-secondary-content bg-opacity-85 flex gap-2'
          }
        >
          <Owner room={props.room!} />
          <div>
            <div class={'font-bold text-lg'}>{props.room!.title}</div>
            <div class={'text-md'}>{props.room!.owner.name}</div>
          </div>
        </div>
      </div>
    </Show>
  )
}

export default Result
