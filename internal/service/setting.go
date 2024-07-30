package service

import (
	"asmblive/internal/setting"
	"asmblive/internal/store"
	"log/slog"
)

type SettingService struct {
	setting.Bili
}

func NewSettingService(log *slog.Logger) *SettingService {
	log = log.With("module", "service/platform")
	s := store.New[map[string]string]("settings", make(map[string]string))
	return &SettingService{
		Bili: setting.Bili{
			Store: s,
			Log:   log,
		},
	}
}
