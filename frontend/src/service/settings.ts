import { GetBiliCookie, SetBiliCookie } from 'wails/go/service/SettingService'

export const getBiliCookie = GetBiliCookie

export const setBiliCookie = (cookie: string) => SetBiliCookie(cookie)
