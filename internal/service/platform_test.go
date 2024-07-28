package service

import (
	"asmblive/internal/platform"
	"context"
	"errors"
	"log/slog"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

type mockPlatform struct {
	id      string
	name    string
	iconUrl url.URL

	room    platform.Room
	roomErr error

	qualities    []platform.Quality
	qualitiesErr error

	liveUrls    []url.URL
	liveUrlsErr error
}

func (m mockPlatform) Id() string {
	return m.id
}

func (m mockPlatform) Name() string {
	return m.name
}

func (m mockPlatform) IconUrl() url.URL {
	return m.iconUrl
}

func (m mockPlatform) GetRoom(ctx context.Context, roomId string) (platform.Room, error) {
	return m.room, m.roomErr
}

func (m mockPlatform) GetQualities(ctx context.Context, roomId string) ([]platform.Quality, error) {
	return m.qualities, m.qualitiesErr
}

func (m mockPlatform) GetLiveUrls(ctx context.Context, roomId string, qualityId string) ([]url.URL, error) {
	return m.liveUrls, m.liveUrlsErr
}

func TestService_GetPlatforms(t *testing.T) {
	type fields struct {
		pm map[string]platform.Platform
	}
	tests := []struct {
		name   string
		fields fields
		want   []*PlatformDto
	}{
		{
			name:   "shorld return zero-length slice",
			fields: fields{pm: make(map[string]platform.Platform)},
			want:   make([]*PlatformDto, 0),
		},
		{
			name: "shorld return 1 platform",
			fields: fields{pm: map[string]platform.Platform{
				"test": mockPlatform{
					id:   "testId",
					name: "testName",
					iconUrl: url.URL{
						Scheme: "https",
						Host:   "test.com",
						Path:   "/favicon.ico",
					},
				},
			}},
			want: []*PlatformDto{{
				Id:      "testId",
				Name:    "testName",
				IconUrl: "https://test.com/favicon.ico",
			}},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &PlatformService{
				log: slog.Default(),
				pm:  tt.fields.pm,
			}
			got := s.GetPlatforms()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestService_GetPlatform(t *testing.T) {
	type fields struct {
		pm map[string]platform.Platform
	}
	type args struct {
		platformId string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *PlatformDto
	}{
		{
			name: "should return platform",
			fields: fields{pm: map[string]platform.Platform{
				"testId": mockPlatform{
					id:   "testId",
					name: "testName",
					iconUrl: url.URL{
						Scheme: "https",
						Host:   "test.com",
						Path:   "/favicon.ico",
					},
				},
			}},
			args: args{platformId: "testId"},
			want: &PlatformDto{
				Id:      "testId",
				Name:    "testName",
				IconUrl: "https://test.com/favicon.ico",
			},
		},
		{
			name:   "should return nil",
			fields: fields{pm: make(map[string]platform.Platform, 0)},
			args:   args{platformId: "testId"},
			want:   nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := PlatformService{
				log: slog.Default(),
				pm:  tt.fields.pm,
			}
			assert.Equal(t, tt.want, s.GetPlatform(tt.args.platformId))
		})
	}
}

func TestService_GetRoom(t *testing.T) {
	type fields struct {
		pm map[string]platform.Platform
	}
	type args struct {
		platformId string
		roomId     string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *RoomDto
	}{
		{
			name: "should return room",
			fields: fields{pm: map[string]platform.Platform{
				"testPlatform": mockPlatform{
					id:   "testPlatform",
					name: "testPlatformName",
					iconUrl: url.URL{
						Scheme: "https",
						Host:   "test.com",
						Path:   "/favicon.ico",
					},
					room: platform.Room{
						Id:    "testRoom",
						Title: "testRoomTitle",
						Owner: platform.Owner{
							Id:   "testOwner",
							Name: "testOwnerName",
							AvatarUrl: url.URL{
								Scheme: "https",
								Host:   "test.com",
								Path:   "/avatar.png",
							},
						},
						IsOnline: true,
						CoverUrl: url.URL{
							Scheme: "https",
							Host:   "test.com",
							Path:   "/cover.png",
						},
					},
				},
			}},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: &RoomDto{
				Id:    "testRoom",
				Title: "testRoomTitle",
				Owner: OwnerDto{
					Id:        "testOwner",
					Name:      "testOwnerName",
					AvatarUrl: "https://test.com/avatar.png",
				},
				IsOnline: true,
				CoverUrl: "https://test.com/cover.png",
				Platform: PlatformDto{
					Id:      "testPlatform",
					Name:    "testPlatformName",
					IconUrl: "https://test.com/favicon.ico",
				},
			},
		},
		{
			name:   "should return nil since no platform",
			fields: fields{pm: make(map[string]platform.Platform, 0)},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: nil,
		},
		{
			name: "should return nil since no room",
			fields: fields{pm: map[string]platform.Platform{
				"testPlatform": mockPlatform{
					id:   "testPlatform",
					name: "testPlatformName",
					iconUrl: url.URL{
						Scheme: "https",
						Host:   "test.com",
						Path:   "/favicon.ico",
					},
					roomErr: errors.New("no room"),
				},
			}},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := PlatformService{
				log: slog.Default(),
				pm:  tt.fields.pm,
			}
			assert.Equalf(t, tt.want, s.GetRoom(tt.args.platformId, tt.args.roomId), "GetRoom(%v, %v)", tt.args.platformId, tt.args.roomId)
		})
	}
}

func TestService_GetQualities(t *testing.T) {
	type fields struct {
		pm map[string]platform.Platform
	}
	type args struct {
		platformId string
		roomId     string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   []*QualityDto
	}{
		{
			name: "should return room",
			fields: fields{pm: map[string]platform.Platform{
				"testPlatform": mockPlatform{
					qualities: []platform.Quality{
						{
							Id:       "1000",
							Name:     "原画",
							Priority: -1,
						},
						{
							Id:       "500",
							Name:     "高清",
							Priority: -2,
						},
					},
				},
			}},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: []*QualityDto{
				{
					Id:       "1000",
					Name:     "原画",
					Priority: -1,
				},
				{
					Id:       "500",
					Name:     "高清",
					Priority: -2,
				},
			},
		},
		{
			name:   "should return nil since no platform",
			fields: fields{pm: make(map[string]platform.Platform, 0)},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: nil,
		},
		{
			name: "should return nil since fail to get qualities",
			fields: fields{pm: map[string]platform.Platform{
				"testPlatform": mockPlatform{
					qualitiesErr: errors.New("no qualities"),
				},
			}},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := PlatformService{
				log: slog.Default(),
				pm:  tt.fields.pm,
			}
			assert.Equal(t, tt.want, s.GetQualities(tt.args.platformId, tt.args.roomId))
		})
	}
}

func TestService_GetLiveUrls(t *testing.T) {
	type fields struct {
		pm map[string]platform.Platform
	}
	type args struct {
		platformId string
		roomId     string
		qualityId  string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   []string
	}{
		{
			name: "should return urls",
			fields: fields{pm: map[string]platform.Platform{
				"testPlatform": mockPlatform{
					liveUrls: []url.URL{
						{
							Scheme: "https",
							Host:   "test.com",
							Path:   "/live",
						},
						{
							Scheme: "https",
							Host:   "test.com",
							Path:   "/live2",
						},
					},
				},
			}},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: []string{
				"https://test.com/live",
				"https://test.com/live2",
			},
		},
		{
			name:   "should return nil since no platform",
			fields: fields{pm: make(map[string]platform.Platform, 0)},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: nil,
		},
		{
			name: "should return nil since fail to get urls",
			fields: fields{pm: map[string]platform.Platform{
				"testPlatform": mockPlatform{
					liveUrlsErr: errors.New("no urls"),
				},
			}},
			args: args{
				platformId: "testPlatform",
				roomId:     "testRoom",
			},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := PlatformService{
				log: slog.Default(),
				pm:  tt.fields.pm,
			}
			assert.Equal(t, tt.want, s.GetLiveUrls(tt.args.platformId, tt.args.roomId, tt.args.qualityId))
		})
	}
}
