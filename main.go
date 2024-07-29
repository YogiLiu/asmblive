package main

import (
	"asmblive/internal/service"
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

	pfSrv, pfSu, pfSd := service.NewPlatformService(log)
	bSrv := service.NewBoardService(log)

	err := wails.Run(&options.App{
		Title:  "Asmblive",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: options.NewRGB(255, 255, 255),
		OnStartup:        pfSu,
		OnShutdown:       pfSd,
		Bind: []interface{}{
			vs,
			pfSrv,
			bSrv,
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
