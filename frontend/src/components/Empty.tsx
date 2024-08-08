import { Component } from 'solid-js'

const Empty: Component = () => {
  return (
    <div class={'w-full text-center py-8 text-neutral-content'}>
      <span class={'iconify ph--empty align-middle'} />
      <span class={'ml-2'}>空空如也</span>
    </div>
  )
}

export default Empty
