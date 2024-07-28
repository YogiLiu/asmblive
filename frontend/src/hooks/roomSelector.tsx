import { service } from 'wails/go/models'
import { createSignal, JSX } from 'solid-js'
import RoomSelector from '../components/roomSelector'

type OnSelect = (room: service.RoomDto) => void

export const useRoomSelector = (
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
