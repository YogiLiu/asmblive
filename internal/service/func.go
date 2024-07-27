package service

import "context"

type (
	StartupFunc  func(ctx context.Context)
	ShutdownFunc func(ctx context.Context)
)
