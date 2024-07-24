package bili

import (
	"asmblive/internal/platform"
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"strconv"
)

type Bili struct {
	log *slog.Logger
	pc  platform.Client
	// built-in HTTP server base URL
	su url.URL
}

func NewBili(l *slog.Logger, c platform.Client, su url.URL) *Bili {
	l = l.With("module", "platform/bili")
	return &Bili{
		log: l,
		pc:  c,
		su:  su,
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
	bc := biliClient[roomDetail]{b.pc, b.log}
	u := url.URL{
		Scheme: "https",
		Host:   "api.live.bilibili.com",
		Path:   "/xlive/web-room/v1/index/getH5InfoByRoom",
	}
	q := u.Query()
	q.Set("room_id", roomId)
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return platform.Room{}, ErrGetRoom(err)
	}
	rd, err := bc.getJson(req)
	if err != nil {
		return platform.Room{}, ErrGetRoom(err)
	}
	cu, err := url.Parse(rd.RoomInfo.Cover)
	if err != nil {
		return platform.Room{}, ErrGetRoom(fmt.Errorf("failed to parse cover url: %w", err))
	}
	au, err := url.Parse(rd.AnchorInfo.BaseInfo.Face)
	if err != nil {
		return platform.Room{}, ErrGetRoom(fmt.Errorf("failed to parse avatar url: %w", err))
	}
	return platform.Room{
		Id:       strconv.FormatInt(rd.RoomInfo.RoomId, 10),
		Title:    rd.RoomInfo.Title,
		IsOnline: rd.RoomInfo.LiveStatus == 1,
		CoverUrl: *cu,
		Owner: platform.Owner{
			Id:        strconv.FormatInt(rd.RoomInfo.Uid, 10),
			Name:      rd.AnchorInfo.BaseInfo.Uname,
			AvatarUrl: *au,
		},
	}, nil
}

func (b Bili) GetQualities(ctx context.Context, roomId string) ([]platform.Quality, error) {
	//TODO implement me
	panic("implement me")
}

func (b Bili) GetLiveUrls(ctx context.Context, roomId string, qualityId string) ([]url.URL, error) {
	//TODO implement me
	panic("implement me")
}
