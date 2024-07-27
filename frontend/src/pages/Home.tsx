import { Component } from 'solid-js'
import { A } from '@solidjs/router'

const Home: Component = () => {
  return (
    <div>
      <A href={'/board'} class={'btn btn-primary'}>
        Go to Board
      </A>
    </div>
  )
}

export default Home
