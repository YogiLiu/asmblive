package main

import "log/slog"

type logger struct {
	log *slog.Logger
}

func (l logger) Print(message string) {
	l.log.Info(message, "wailsLevel", "Print")
}

func (l logger) Trace(message string) {
	l.log.Debug(message, "wailsLevel", "Trace")
}

func (l logger) Debug(message string) {
	l.log.Debug(message, "wailsLevel", "Debug")
}

func (l logger) Info(message string) {
	l.log.Info(message, "wailsLevel", "Info")
}

func (l logger) Warning(message string) {
	l.log.Warn(message, "wailsLevel", "Warning")
}

func (l logger) Error(message string) {
	l.log.Error(message, "wailsLevel", "Error")
}

func (l logger) Fatal(message string) {
	l.log.Error(message, "wailsLevel", "Fatal")
}
