package service

import (
	"asmblive/internal/server"
	"fmt"
	"strings"
)

type BoardDTO struct {
	Id    string         `json:"id"`
	Name  string         `json:"name"`
	Rooms []BoardRoomDTO `json:"rooms"`
}

func (b BoardDTO) cleanProxyPrefix(srv server.Server) BoardDTO {
	rooms := make([]BoardRoomDTO, len(b.Rooms))
	for i, r := range b.Rooms {
		rooms[i] = r.cleanProxyPrefix(srv)
	}
	b.Rooms = rooms
	return b
}

func (b BoardDTO) restoreProxyPrefix(srv server.Server) BoardDTO {
	rooms := make([]BoardRoomDTO, len(b.Rooms))
	for i, r := range b.Rooms {
		rooms[i] = r.restoreProxyPrefix(srv)
	}
	b.Rooms = rooms
	return b
}

type BoardRoomDTO struct {
	Id         string `json:"id"`
	PlatformId string `json:"platformId"`
	AvatarUrl  string `json:"avatarUrl"`
}

const proxyPlaceHolder = "(proxyUrl)"

func (r BoardRoomDTO) cleanProxyPrefix(srv server.Server) BoardRoomDTO {
	pu := srv.BaseUrl()
	if strings.HasPrefix(r.AvatarUrl, pu.String()) {
		r.AvatarUrl = fmt.Sprintf("%s%s", proxyPlaceHolder, strings.TrimPrefix(r.AvatarUrl, pu.String()))
	}
	return r
}

func (r BoardRoomDTO) restoreProxyPrefix(srv server.Server) BoardRoomDTO {
	pu := srv.BaseUrl()
	if strings.HasPrefix(r.AvatarUrl, proxyPlaceHolder) {
		r.AvatarUrl = fmt.Sprintf("%s%s", pu.String(), strings.TrimPrefix(r.AvatarUrl, proxyPlaceHolder))
	}
	return r
}
