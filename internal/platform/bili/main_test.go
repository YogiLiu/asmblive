package bili

import (
	"asmblive/internal/platform"
	"bytes"
	"context"
	"github.com/stretchr/testify/assert"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"testing"
)

func TestNewBili(t *testing.T) {
	t.Run("should return an id", func(t *testing.T) {
		bili := NewBili(slog.Default(), nil, url.URL{})
		assert.Equal(t, "bili", bili.Id())
	})

	t.Run("should return a name", func(t *testing.T) {
		bili := NewBili(slog.Default(), nil, url.URL{})
		assert.Equal(t, "哔哩哔哩直播", bili.Name())
	})

	t.Run("should return an icon", func(t *testing.T) {
		bili := NewBili(slog.Default(), nil, url.URL{})
		u := bili.IconUrl()
		assert.Equal(t, "https://www.bilibili.com/favicon.ico", u.String())
	})
}

type mc struct {
	res []byte
}

func (c mc) Do(req *http.Request) (*http.Response, error) {
	rc := io.NopCloser(bytes.NewReader(c.res))
	return &http.Response{
		StatusCode: http.StatusOK,
		Header:     http.Header{"Content-Type": []string{"application/json"}},
		Body:       rc,
	}, nil
}

func TestBili_GetRoom(t *testing.T) {
	type fields struct {
		pc platform.Client
	}
	type args struct {
		roomId string
	}
	tests := []struct {
		name    string
		fields  fields
		args    args
		want    platform.Room
		wantErr string
	}{
		{
			name: "should return room by real id",
			fields: fields{
				pc: func() platform.Client {
					data, _ := os.ReadFile("testData/roomDetail.json")
					return mc{res: data}
				}(),
			},
			args: args{
				roomId: "5441",
			},
			want: platform.Room{
				Id:       "5441",
				Title:    "【二台】俺也玩鸣潮",
				IsOnline: false,
				CoverUrl: url.URL{
					Scheme: "http",
					Host:   "i0.hdslb.com",
					Path:   "/bfs/live/new_room_cover/ad393b7cbe9afbd97404a3deacadba5a8dafae35.jpg",
				},
				Owner: platform.Owner{
					Id:   "322892",
					Name: "痒局长",
					AvatarUrl: url.URL{
						Scheme: "https",
						Host:   "i2.hdslb.com",
						Path:   "/bfs/face/2de1011b30ad531b64a40ca5788e1dcf2509874f.webp",
					},
				},
			},
		},
		{
			name: "should return room by short id",
			fields: fields{
				pc: func() platform.Client {
					data, _ := os.ReadFile("testData/roomDetail.json")
					return mc{res: data}
				}(),
			},
			args: args{
				roomId: "528",
			},
			want: platform.Room{
				Id:       "5441",
				Title:    "【二台】俺也玩鸣潮",
				IsOnline: false,
				CoverUrl: url.URL{
					Scheme: "http",
					Host:   "i0.hdslb.com",
					Path:   "/bfs/live/new_room_cover/ad393b7cbe9afbd97404a3deacadba5a8dafae35.jpg",
				},
				Owner: platform.Owner{
					Id:   "322892",
					Name: "痒局长",
					AvatarUrl: url.URL{
						Scheme: "https",
						Host:   "i2.hdslb.com",
						Path:   "/bfs/face/2de1011b30ad531b64a40ca5788e1dcf2509874f.webp",
					},
				},
			},
		},
		{
			name: "should return code error since invalid room id",
			fields: fields{
				pc: func() platform.Client {
					return mc{res: []byte("{\"code\":19002000,\"message\":\"获取初始化数据失败\",\"ttl\":1,\"data\":null}")}
				}(),
			},
			args: args{
				roomId: "112233",
			},
			wantErr: "unexpected response code: 19002000, message: 获取初始化数据失败",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := Bili{
				log: slog.Default(),
				pc:  tt.fields.pc,
				su:  url.URL{},
			}
			got, err := b.GetRoom(context.TODO(), tt.args.roomId)
			if tt.wantErr != "" {
				assert.ErrorContains(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
