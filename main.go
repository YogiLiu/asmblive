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
	srv, st, sd := service.New(log)

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Asmblive",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: options.NewRGB(255, 255, 255),
		OnStartup:        st,
		OnShutdown:       sd,
		Bind: []interface{}{
			srv,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}
