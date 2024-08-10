package bili

import (
	"asmblive/internal/platform"
	"asmblive/internal/server"
	"asmblive/internal/setting"
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
)

type Bili struct {
	log *slog.Logger
	srv server.Server
	pc  platform.Client
	st  *setting.Bili
}

func NewBili(log *slog.Logger, pc platform.Client, st *setting.Bili, srv server.Server) *Bili {
	log = log.With("module", "platform/bili")
	return &Bili{
		log: log,
		pc:  pc,
		st:  st,
		srv: srv,
	}
}

func (b Bili) Id() string {
	return "bili"
}

func (b Bili) Name() string {
	return "哔哩哔哩直播"
}

func (b Bili) IconUrl() url.URL {
	u := url.URL{
		Scheme: "https",
		Host:   "www.bilibili.com",
		Path:   "/favicon.ico",
	}
	return b.srv.GetCorsProxyUrl(u)
}

func (b Bili) GetRoom(ctx context.Context, roomId string) (platform.Room, error) {
	bc := biliClient[roomDetail]{b.pc, b.log, b.st}
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
	pCu := b.srv.GetCorsProxyUrl(*cu)
	au, err := url.Parse(rd.AnchorInfo.BaseInfo.Face)
	if err != nil {
		return platform.Room{}, ErrGetRoom(fmt.Errorf("failed to parse avatar url: %w", err))
	}
	pAu := b.srv.GetCorsProxyUrl(*au)
	return platform.Room{
		Id:       strconv.FormatInt(rd.RoomInfo.RoomId, 10),
		Title:    rd.RoomInfo.Title,
		IsOnline: rd.RoomInfo.LiveStatus == 1,
		CoverUrl: pCu,
		Owner: platform.Owner{
			Id:        strconv.FormatInt(rd.RoomInfo.Uid, 10),
			Name:      rd.AnchorInfo.BaseInfo.Uname,
			AvatarUrl: pAu,
		},
	}, nil
}

func (b Bili) GetQualities(ctx context.Context, roomId string) ([]platform.Quality, error) {
	rpi, err := b.getRoomPlayInfo(ctx, roomId, "")
	if err != nil {
		return []platform.Quality{}, ErrGetQualities(err)
	}
	qm := make(map[int]string)
	for _, d := range rpi.PlayurlInfo.Playurl.GQnDesc {
		qm[d.Qn] = d.Desc
	}
	if len(rpi.PlayurlInfo.Playurl.Stream) == 0 ||
		len(rpi.PlayurlInfo.Playurl.Stream[0].Format) == 0 ||
		len(rpi.PlayurlInfo.Playurl.Stream[0].Format[0].Codec) == 0 {
		return make([]platform.Quality, 0), nil
	}
	qualities := make([]platform.Quality, 0)
	for idx, qn := range rpi.PlayurlInfo.Playurl.Stream[0].Format[0].Codec[0].AcceptQn {
		n, ok := qm[qn]
		if !ok {
			n = "未知"
		}
		qualities = append(qualities, platform.Quality{
			Id:       strconv.Itoa(qn),
			Name:     n,
			Priority: int8(-idx),
		})
	}
	return qualities, nil
}

func (b Bili) GetLiveUrls(ctx context.Context, roomId string, qualityId string) ([]url.URL, error) {
	rpi, err := b.getRoomPlayInfo(ctx, roomId, qualityId)
	if err != nil {
		return []url.URL{}, ErrGetLiveUrls(err)
	}
	if len(rpi.PlayurlInfo.Playurl.Stream) == 0 ||
		len(rpi.PlayurlInfo.Playurl.Stream[0].Format) == 0 {
		return make([]url.URL, 0), nil
	}
	urls := make([]url.URL, 0)
	for _, s := range rpi.PlayurlInfo.Playurl.Stream {
		for _, f := range s.Format {
			for _, c := range f.Codec {
				for _, ui := range c.UrlInfo {
					u, err := url.Parse(ui.Host + c.BaseUrl + ui.Extra)
					if err != nil {
						continue
					}
					urls = append(urls, *u)
				}
			}
		}
	}
	// ensure mcdn urls are at the end
	sort.Slice(urls, func(i int, _ int) bool {
		u := urls[i]
		return !strings.Contains(u.Host, "mcdn")
	})
	return urls, nil
}

func (b Bili) getRoomPlayInfo(ctx context.Context, roomId string, qualityId string) (*roomPlayInfo, error) {
	bc := biliClient[roomPlayInfo]{b.pc, b.log, b.st}
	u := url.URL{
		Scheme: "https",
		Host:   "api.live.bilibili.com",
		Path:   "/xlive/web-room/v2/index/getRoomPlayInfo",
	}
	q := u.Query()
	q.Set("room_id", roomId)
	q.Set("protocol", "0,1")
	q.Set("format", "0,1,2")
	q.Set("codec", "0,1")
	q.Set("platform", "web")
	if qualityId != "" {
		q.Set("qn", qualityId)
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, u.String(), nil)
	if err != nil {
		return nil, errGetRoomPlayInfo(err)
	}
	rpi, err := bc.getJson(req)
	if err != nil {
		return nil, errGetRoomPlayInfo(err)
	}
	return rpi, nil
}
