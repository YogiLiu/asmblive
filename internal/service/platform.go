package service

import (
	"asmblive/internal/platform"
	"asmblive/internal/platform/bili"
	"asmblive/internal/server"
	"context"
	"log/slog"
)

type PlatformService struct {
	log *slog.Logger
	srv server.Server
	pm  map[string]platform.Platform
}

func NewPlatformService(log *slog.Logger, setting *SettingService) (*PlatformService, StartupFunc, ShutdownFunc) {
	log = log.With("module", "service/platform")
	srv := server.New(log)
	c := platform.NewClient(log, platform.Headers{})

	pm := make(map[string]platform.Platform)
	// bilibili
	bl := bili.NewBili(log, c, &setting.Bili)
	pm[bl.Id()] = bl

	s := &PlatformService{
		log: log,
		srv: srv,
		pm:  pm,
	}
	startup := func(ctx context.Context) {
		if err := srv.Start(); err != nil {
			log.Error("failed to start server", "err", err)
			panic(err)
		}
	}
	shutdown := func(ctx context.Context) {
		if err := srv.Stop(ctx); err != nil {
			log.Error("failed to stop server", "err", err)
			panic(err)
		}
	}
	return s, startup, shutdown
}

func (s PlatformService) GetPlatforms() []*PlatformDto {
	ps := make([]*PlatformDto, 0)
	for _, p := range s.pm {
		u := p.IconUrl()
		ps = append(ps, &PlatformDto{
			Id:      p.Id(),
			Name:    p.Name(),
			IconUrl: u.String(),
		})
	}
	s.log.Info("get platforms", "count", len(ps))
	return ps
}

func (s PlatformService) GetPlatform(platformId string) *PlatformDto {
	p, ok := s.pm[platformId]
	if !ok {
		return nil
	}
	u := p.IconUrl()
	s.log.Info("get platform", "id", platformId)
	return &PlatformDto{
		Id:      p.Id(),
		Name:    p.Name(),
		IconUrl: u.String(),
	}
}

func (s PlatformService) GetRoom(platformId string, roomId string) *RoomDto {
	p, ok := s.pm[platformId]
	if !ok {
		s.log.Warn("cannot find platform", "id", platformId)
		return nil
	}
	r, err := p.GetRoom(context.TODO(), roomId)
	if err != nil {
		s.log.Warn("failed to get room", "id", roomId, "err", err)
		return nil
	}
	piu := p.IconUrl()
	s.log.Info("get room", "id", roomId)
	return &RoomDto{
		Id:    r.Id,
		Title: r.Title,
		Owner: OwnerDto{
			Id:        r.Owner.Id,
			Name:      r.Owner.Name,
			AvatarUrl: r.Owner.AvatarUrl.String(),
		},
		IsOnline: r.IsOnline,
		CoverUrl: r.CoverUrl.String(),
		Platform: PlatformDto{
			Id:      p.Id(),
			Name:    p.Name(),
			IconUrl: piu.String(),
		},
	}
}

func (s PlatformService) GetQualities(platformId string, roomId string) []*QualityDto {
	p, ok := s.pm[platformId]
	if !ok {
		s.log.Warn("cannot find platform", "id", platformId)
		return nil
	}
	qs, err := p.GetQualities(context.TODO(), roomId)
	if err != nil {
		s.log.Warn("failed to get qualities", "roomId", roomId, "err", err)
		return nil
	}
	r := make([]*QualityDto, len(qs))
	for i, q := range qs {
		r[i] = &QualityDto{
			Id:       q.Id,
			Name:     q.Name,
			Priority: q.Priority,
		}
	}
	s.log.Info("get qualities", "roomId", roomId, "count", len(r))
	return r
}

func (s PlatformService) GetLiveUrls(platformId string, roomId string, qualityId string) []string {
	p, ok := s.pm[platformId]
	if !ok {
		s.log.Warn("cannot find platform", "id", platformId)
		return nil
	}
	us, err := p.GetLiveUrls(context.TODO(), roomId, qualityId)
	if err != nil {
		s.log.Warn("failed to get live urls", "roomId", roomId, "qualityId", qualityId, "err", err)
		return nil
	}
	r := make([]string, len(us))
	for i, u := range us {
		r[i] = u.String()
	}
	s.log.Info("get live urls", "roomId", roomId, "qualityId", qualityId, "count", len(r))
	return r
}
