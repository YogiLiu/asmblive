export type BoardRoom = {
  id: string
  platformId: string
  avatarUrl: string
}

export type Board = {
  id: string
  name: string
  rooms: BoardRoom[]
}

export type Owner = {
  id: string
  name: string
  avatarUrl: string
}

export type Platform = {
  id: string
  name: string
  iconUrl: string
}

export type Quality = {
  id: string
  name: string
  priority: number
}

export type Room = {
  id: string
  title: string
  owner: Owner
  isOnline: boolean
  coverUrl: string
  platform: Platform
}
