import { Component } from 'solid-js'
import { useRoomGetter } from '../hooks/roomGetter'

const Home: Component = () => {
  const [roomGetter, setShow] = useRoomGetter((room) => console.log(room))
  return (
    <div>
      <button onClick={setShow} class={'btn btn-secondary-content'}>
        <span class={'iconify ph--plus-bold'}> </span>
      </button>
      {roomGetter}
    </div>
  )
}

export default Home
