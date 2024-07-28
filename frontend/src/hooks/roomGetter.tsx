import { service } from 'wails/go/models'
import { createSignal, JSX } from 'solid-js'
import Selector from '../components/roomGetter/Selector'

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
    <Selector onSelect={selectHandler} show={show()} />,
    () => setShow(true),
  ]
}
