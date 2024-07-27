import { Component } from 'solid-js'
import { service } from 'wails/go/models.ts'

type Props = {
  room: service.RoomDto
}

const Owner: Component<Props> = (props) => {
  return (
    <div class={'relative w-fit h-fit'}>
      {/* online status */}
      <span
        class={'absolute top-0 right-0 h-2 w-2 rounded-full'}
        classList={{
          'bg-warning': !props.room.isOnline,
          'bg-success': props.room.isOnline,
        }}
      />
      <span
        class={
          'animate-ping absolute top-0 right-0 h-2 w-2 rounded-full bg-success opacity-75'
        }
        classList={{
          'bg-warning': !props.room.isOnline,
          'bg-success': props.room.isOnline,
        }}
      />
      {/* owner avatar */}
      <img
        class={'rounded-box border border-primary w-12 h-12'}
        src={props.room.owner!.avatarUrl}
        alt={props.room.owner!.name}
      />
      {/* platform icon */}
      <img
        class={'absolute w-5 h-5 bottom-0 right-0 bg-base-100 rounded-full p-1'}
        src={props.room.platform!.iconUrl}
        alt={props.room.platform!.name}
      />
    </div>
  )
}

export default Owner
