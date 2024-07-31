import { createSignal, JSX } from 'solid-js'
import RoomSelector from '../components/roomSelector'
import { Room } from '../service/types'

type OnSelect = (room: Room) => void

export const useRoomSelector = (
  onSelect: OnSelect,
): [JSX.Element, () => void] => {
  const [show, setShow] = createSignal(false)
  const selectHandler = (room: Room | null) => {
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
