import { Component, Show } from 'solid-js'
import Owner from '../Owner'
import Empty from '../Empty'
import { Room } from '../../service/types'

type OnSelect = (room: Room) => void

const Result: Component<{
  room: Room | null
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
        <div class={'w-full aspect-video'}>
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
