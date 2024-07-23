package platform

import "fmt"

func ErrRequest(err error) error {
	return fmt.Errorf("request failed: %w", err)
}
