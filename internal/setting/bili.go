package setting

import (
	"asmblive/internal/store"
	"log/slog"
)

const biliCookieKey = "bili_cookie"

type Bili struct {
	Store store.Store[map[string]string]
	Log   *slog.Logger
}

func (b Bili) GetBiliCookie() string {
	c, err := b.Store.Read()
	if err != nil {
		b.Log.Error("Failed to read bili cookie", "err", err)
		return ""
	}
	return c[biliCookieKey]
}

func (b Bili) SetBiliCookie(cookie string) string {
	c, err := b.Store.Read()
	if err != nil {
		b.Log.Error("Failed to read bili cookie", "err", err)
		return ""
	}
	c[biliCookieKey] = cookie
	err = b.Store.Write(c)
	if err != nil {
		b.Log.Error("Failed to write bili cookie", "err", err)
		return ""
	}
	return cookie
}
