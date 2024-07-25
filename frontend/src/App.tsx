import { Component, createResource, For } from 'solid-js'
import { GetPlatforms } from '../wailsjs/go/service/Service'

const App: Component = () => {
  const [platforms] = createResource(GetPlatforms, { initialValue: [] })
  return (
    <div>
      <For each={platforms()}>
        {(platform) => (
          <div>
            <img src={platform.iconUrl} alt={platform.name} />
            <span>{platform.id}</span>
            <span>{platform.name}</span>
          </div>
        )}
      </For>
    </div>
  )
}

export default App
