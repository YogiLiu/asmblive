package service

type PlatformDto struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	IconUrl string `json:"iconUrl"`
}

type RoomDto struct {
	Id       string      `json:"id"`
	Title    string      `json:"title"`
	Owner    OwnerDto    `json:"owner"`
	IsOnline bool        `json:"isOnline"`
	CoverUrl string      `json:"coverUrl"`
	Platform PlatformDto `json:"platform"`
}

type OwnerDto struct {
	Id        string `json:"id"`
	Name      string `json:"name"`
	AvatarUrl string `json:"avatarUrl"`
}

type QualityDto struct {
	Id       string `json:"id"`
	Name     string `json:"name"`
	Priority int8   `json:"priority"`
}
