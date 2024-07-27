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
	hdl := slog.NewTextHandler(os.Stderr, &slog.HandlerOptions{Level: slog.LevelInfo})
	log := slog.New(hdl)

	// Create an instance of the app structure
	pfSrv, pfSu, pfSd := service.NewPlatformService(log)

	// Create application with options
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
			pfSrv,
		},
		Logger: logger{log: log.With("module", "wails")},
		DragAndDrop: &options.DragAndDrop{
			DisableWebViewDrop: true,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
