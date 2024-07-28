package service

type BoardDTO struct {
	Id    string         `json:"id"`
	Name  string         `json:"name"`
	Rooms []BoardRoomDTO `json:"rooms"`
}

type BoardRoomDTO struct {
	Id         string `json:"id"`
	PlatformId string `json:"platformId"`
	AvatarUrl  string `json:"avatarUrl"`
}
