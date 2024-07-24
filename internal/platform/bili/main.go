package bili

import (
	"asmblive/internal/platform"
	"asmblive/internal/proxy"
	"context"
	"log/slog"
	"net/url"
)

type Bili struct {
	log *slog.Logger
	hc  *platform.Client
	prx *proxy.Proxy
}

func NewBili(l *slog.Logger, c *platform.Client, p *proxy.Proxy) *Bili {
	l = l.With("module", "platform/bili")
	return &Bili{
		log: l,
		hc:  c,
		prx: p,
	}
}

func (b Bili) Id() string {
	return "bili"
}

func (b Bili) Name() string {
	return "哔哩哔哩直播"
}

func (b Bili) IconUrl() url.URL {
	return url.URL{
		Scheme: "https",
		Host:   "www.bilibili.com",
		Path:   "/favicon.ico",
	}
}

func (b Bili) GetRoom(ctx context.Context, roomId string) (platform.Room, error) {
	//TODO implement me
	panic("implement me")
}

func (b Bili) GetQualities(ctx context.Context, roomId string) ([]platform.Quality, error) {
	//TODO implement me
	panic("implement me")
}

func (b Bili) GetLiveUrls(ctx context.Context, roomId string, qualityId string) ([]url.URL, error) {
	//TODO implement me
	panic("implement me")
}