import { Component } from 'solid-js'
import BiliCookie from '../components/settings/BiliCookie'
import { A } from '@solidjs/router'

const Setting: Component = () => {
  return (
    <div
      class={
        'mx-auto px-1 py-8 w-1/2 min-w-96 flex flex-col gap-4 h-screen overflow-auto'
      }
    >
      <h1 class={'flex items-center'}>
        <A href={'/'} class={'btn btn-sm'}>
          <span class={'iconify ph--arrow-bend-up-left'} title={'返回'} />
        </A>
        <span class={'font-bold text-lg ml-2'}>设置</span>
      </h1>
      <BiliCookie />
    </div>
  )
}

export default Setting
