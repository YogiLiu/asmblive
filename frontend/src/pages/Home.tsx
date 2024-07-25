import { Component, createResource, For } from 'solid-js'
import { GetPlatforms } from '../../wailsjs/go/service/Service'

const Home: Component = () => {
  const [platforms] = createResource(GetPlatforms, { initialValue: [] })
  return (
    <div>
      <For each={platforms()}>
        {(platform) => (
          <div class={'font-bold'}>
            <img src={platform.iconUrl} alt={platform.name} />
            <span class={'text-red-500'}>{platform.id}</span>
            <span class={'text-sky-500'}>{platform.name}</span>
          </div>
        )}
      </For>
    </div>
  )
}

export default Home
