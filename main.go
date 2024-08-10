package main

import (
	"asmblive/internal/server"
	"asmblive/internal/service"
	"context"
	"embed"
	"log/slog"
	"os"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	vs := &version{}

	hdl := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelInfo})
	log := slog.New(hdl)
	log = log.With("version", vs.GetVersion())

	sv := server.New(log)

	stSrv := service.NewSettingService(log)
	pfSrv := service.NewPlatformService(log, stSrv, sv)
	bSrv := service.NewBoardService(log, sv)

	startup := func(ctx context.Context) {
		if err := sv.Start(); err != nil {
			log.Error("failed to start server", "err", err)
			panic(err)
		}
	}
	shutdown := func(ctx context.Context) {
		if err := sv.Stop(ctx); err != nil {
			log.Error("failed to stop server", "err", err)
			panic(err)
		}
	}

	err := wails.Run(&options.App{
		Title:  "Asmblive",
		Width:  1440,
		Height: 840,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: options.NewRGB(255, 255, 255),
		OnStartup:        startup,
		OnShutdown:       shutdown,
		Bind: []interface{}{
			vs,
			pfSrv,
			bSrv,
			stSrv,
		},
		Logger: logger{log: log.With("module", "wails")},
		DragAndDrop: &options.DragAndDrop{
			DisableWebViewDrop: true,
		},
	})

	if err != nil {
		log.Error("Error running app", "err", err)
	}
}
