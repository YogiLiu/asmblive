package bili

import "fmt"

func ErrGetRoom(err error) error {
	return fmt.Errorf("failed to get room: %w", err)
}
