package server

import "fmt"

func ErrServerStart(err error) error {
	return fmt.Errorf("failed to start server: %w", err)
}

func ErrServerStop(err error) error {
	return fmt.Errorf("failed to stop server: %w", err)
}
