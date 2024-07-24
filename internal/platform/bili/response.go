package bili

type response[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}

type roomDetail struct {
	RoomInfo struct {
		RoomId     int64  `json:"room_id"`
		Title      string `json:"title"`
		Uid        int64  `json:"uid"`
		LiveStatus int8   `json:"live_status"`
		Cover      string `json:"cover"`
	} `json:"room_info"`

	AnchorInfo struct {
		BaseInfo struct {
			Uname string `json:"uname"`
			Face  string `json:"face"`
		} `json:"base_info"`
	} `json:"anchor_info"`
}
