import { Component } from 'solid-js'

const Offline: Component = () => {
  return (
    <div
      class={'flex flex-col justify-center items-center text-neutral-content'}
    >
      <span class={'iconify ph--receipt-x text-5xl '} />
      <span class={'font-light text-sm'}>未开播</span>
    </div>
  )
}

export default Offline
