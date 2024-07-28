import { Component } from 'solid-js'

const Loading: Component = () => {
  return (
    <div class={'w-full text-center py-8 text-neutral-content'}>
      <span class="loading loading-bars loading-md" />
    </div>
  )
}

export default Loading
