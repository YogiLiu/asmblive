package service

import (
	"asmblive/internal/server"
	"asmblive/internal/store"
	"log/slog"
)

type BoardService struct {
	log *slog.Logger
	st  store.Store[[]BoardDTO]
	srv server.Server
}

func NewBoardService(log *slog.Logger, srv server.Server) *BoardService {
	log = log.With("module", "service/platform")
	st := store.New[[]BoardDTO]("boards", make([]BoardDTO, 0))
	return &BoardService{
		log: log,
		st:  st,
		srv: srv,
	}
}

func (s BoardService) GetBoards() []BoardDTO {
	bs, err := s.st.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
		return make([]BoardDTO, 0)
	}
	for i, b := range bs {
		bs[i] = b.restoreProxyPrefix(s.srv)
	}
	return bs
}

func (s BoardService) GetBoard(bId string) *BoardDTO {
	bs, err := s.st.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
		return nil
	}
	for _, b := range bs {
		if b.Id == bId {
			b = b.restoreProxyPrefix(s.srv)
			return &b
		}
	}
	return nil
}

func (s BoardService) AddBoard(b BoardDTO) *BoardDTO {
	bs, err := s.st.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
		return nil
	}
	b = b.cleanProxyPrefix(s.srv)
	newBs := append(bs, b)
	err = s.st.Write(newBs)
	if err != nil {
		s.log.Error("error writing boards", "err", err)
		return nil
	}
	return &b
}

func (s BoardService) RemoveBoard(bId string) *BoardDTO {
	bs, err := s.st.Read()
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
	err = s.st.Write(newBs)
	if err != nil {
		s.log.Error("error writing boards", "err", err)
		return nil
	}
	removed = removed.restoreProxyPrefix(s.srv)
	return &removed
}

func (s BoardService) UpdateBoard(nb BoardDTO) *BoardDTO {
	bs, err := s.st.Read()
	if err != nil {
		s.log.Error("error getting boards", "err", err)
	}
	var updated bool
	for i, b := range bs {
		if b.Id == nb.Id {
			updated = true
			bs[i] = nb.cleanProxyPrefix(s.srv)
			break
		}
	}
	if !updated {
		s.log.Error("error updating board", "err", "board not found")
		return nil
	}
	err = s.st.Write(bs)
	if err != nil {
		s.log.Error("error writing boards", "err", err)
		return nil
	}
	return &nb
}
