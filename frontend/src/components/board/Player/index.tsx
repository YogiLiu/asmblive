import { Component } from 'solid-js'
import { Room } from '../../../service/types'
import { PlayerMetaProvider } from './playerMeta'
import PlayerWrapper from './PlayerWrapper'

type Props = {
  room: Room
}

const Player: Component<Props> = (props) => {
  return (
    <PlayerMetaProvider room={props.room}>
      <PlayerWrapper room={props.room} />
    </PlayerMetaProvider>
  )
}

export default Player
