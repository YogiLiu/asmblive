import { Board } from './types'
import {
  AddBoard,
  GetBoard,
  GetBoards,
  RemoveBoard,
  UpdateBoard,
} from 'wails/go/service/BoardService'
import { service } from 'wails/go/models'
import { nanoid } from 'nanoid'

export const getBorders = async (): Promise<Board[]> => {
  const bs = await GetBoards()
  return bs.map((b) => {
    return {
      id: b.id,
      name: b.name,
      rooms: b.rooms.map((r) => {
        return {
          id: r.id,
          platformId: r.platformId,
          avatarUrl: r.avatarUrl,
        }
      }),
    }
  })
}

export const getBoard = async (id: string): Promise<Board> => {
  const b = await GetBoard(id)
  return {
    id: b.id,
    name: b.name,
    rooms: b.rooms.map((r) => {
      return {
        id: r.id,
        platformId: r.platformId,
        avatarUrl: r.avatarUrl,
      }
    }),
  }
}

const defaultBoardName = '未命名看板'

export const addBoard = async (): Promise<Board[]> => {
  const bs = await AddBoard(
    new service.BoardDTO({
      id: nanoid(),
      name: defaultBoardName,
      rooms: [],
    }),
  )
  return bs.map((b) => {
    return {
      id: b.id,
      name: b.name,
      rooms: b.rooms.map((r) => {
        return {
          id: r.id,
          platformId: r.platformId,
          avatarUrl: r.avatarUrl,
        }
      }),
    }
  })
}

export const removeBoard = async (id: string): Promise<Board> => {
  const b = await RemoveBoard(id)
  return {
    id: b.id,
    name: b.name,
    rooms: b.rooms.map((r) => {
      return {
        id: r.id,
        platformId: r.platformId,
        avatarUrl: r.avatarUrl,
      }
    }),
  }
}

export const updateBoard = async (b: Board): Promise<Board> => {
  const nb = await UpdateBoard(new service.BoardDTO(b))
  return {
    id: nb.id,
    name: nb.name,
    rooms: nb.rooms.map((r) => {
      return {
        id: r.id,
        platformId: r.platformId,
        avatarUrl: r.avatarUrl,
      }
    }),
  }
}
