package platform

import (
	"context"
	"net/url"
)

type Platform interface {
	Id() string
	Name() string
	IconUrl() url.URL

	GetQualities(ctx context.Context, roomId string) ([]Quality, error)
	GetLiveUrls(ctx context.Context, roomId string, qualityId string) ([]url.URL, error)
}

type Room struct {
	Id         string
	Title      string
	Owner      string
	Popularity int
	CoverUrl   url.URL
}

type Owner struct {
	Id        string
	Name      string
	AvatarUrl url.URL
}

type Quality struct {
	Id       string
	Name     string
	Priority int8
}
