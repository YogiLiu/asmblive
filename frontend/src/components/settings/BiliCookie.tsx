import {
  Component,
  JSX,
  createResource,
  createMemo,
  createSignal,
} from 'solid-js'
import { GetBiliCookie, SetBiliCookie } from 'wails/go/service/SettingService'

const BiliCookie: Component = () => {
  const [cookie, { mutate }] = createResource(GetBiliCookie, {
    initialValue: '',
  })
  const handleChange: JSX.EventHandler<HTMLInputElement, Event> = async (
    event,
  ) => {
    const value = event.currentTarget.value
    const c = await SetBiliCookie(value)
    mutate(c)
  }
  const [show, setShow] = createSignal(false)
  const showtype = createMemo(() => {
    if (show()) {
      return 'text'
    }
    return 'password'
  })
  return (
    <div>
      <h2 class={'mb-2 flex items-center'}>
        <span>哔哩哔哩 Cookie</span>
        <span
          onClick={() => setShow((s) => !s)}
          class={'ml-2 cursor-pointer iconify'}
          classList={{
            'ph--eye-fill': !show(),
            'ph--eye-slash-fill': show(),
          }}
        />
      </h2>
      <input
        type={showtype()}
        value={cookie()}
        onChange={handleChange}
        placeholder={'填写 Cookie 才能拿到更高清直播源'}
        class={'input input-bordered w-full'}
      />
    </div>
  )
}

export default BiliCookie
