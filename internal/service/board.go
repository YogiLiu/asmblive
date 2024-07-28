package service

import (
	"asmblive/internal/store"
	"log/slog"
)

type BoardService struct {
	log *slog.Logger
	s   store.Store[[]BoardDTO]
}

func NewBoardService(log *slog.Logger) *BoardService {
	log = log.With("module", "service")
	s := store.New[[]BoardDTO]("boards")
	return &BoardService{
		log: log,
		s:   s,
	}
}

func (s BoardService) GetBoards() []BoardDTO {
	bs, err := s.s.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
		return make([]BoardDTO, 0)
	}
	return bs
}

func (s BoardService) GetBoard(bId string) *BoardDTO {
	bs, err := s.s.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
		return nil
	}
	for _, b := range bs {
		if b.Id == bId {
			return &b
		}
	}
	return nil
}

func (s BoardService) AddBoard(b BoardDTO) []BoardDTO {
	bs, err := s.s.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
		return nil
	}
	newBs := append(bs, b)
	err = s.s.Write(newBs)
	if err != nil {
		s.log.Error("error writing boards", "err", err)
		return nil
	}
	return newBs
}

func (s BoardService) RemoveBoard(bId string) *BoardDTO {
	bs, err := s.s.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
		return nil
	}
	newBs := make([]BoardDTO, 0, len(bs))
	var removed BoardDTO
	for _, b := range bs {
		if b.Id != bId {
			newBs = append(newBs, b)
		} else {
			removed = b
		}
	}
	if removed.Id == "" {
		s.log.Error("error removing board", "err", "board not found")
		return nil
	}
	err = s.s.Write(newBs)
	if err != nil {
		s.log.Error("error writing boards", "err", err)
		return nil
	}
	return &removed
}

func (s BoardService) UpdateBoard(nb BoardDTO) *BoardDTO {
	bs, err := s.s.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
	}
	var updated bool
	for i, b := range bs {
		if b.Id == nb.Id {
			updated = true
			bs[i] = nb
			break
		}
	}
	if !updated {
		s.log.Error("error updating board", "err", "board not found")
		return nil
	}
	err = s.s.Write(bs)
	if err != nil {
		s.log.Error("error writing boards", "err", err)
		return nil
	}
	return &nb
}
