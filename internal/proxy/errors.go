package proxy

import "errors"

var (
	ErrNotRunning     = errors.New("proxy is not running")
	ErrAlreadyRunning = errors.New("proxy is already running")
	ErrInvalidOrigin  = errors.New("invalid origin")
)
