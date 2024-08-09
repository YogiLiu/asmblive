import { Component } from 'solid-js'

const Loading: Component = () => {
  return (
    <div class={'flex justify-center items-center text-neutral-content'}>
      <span class={'loading loading-bars loading-md'} />
    </div>
  )
}

export default Loading
