package bili

import "fmt"

func ErrGetRoom(err error) error {
	return fmt.Errorf("failed to get room: %w", err)
}

func ErrGetQualities(err error) error {
	return fmt.Errorf("failed to get qualities: %w", err)
}

func ErrGetLiveUrls(err error) error {
	return fmt.Errorf("failed to get live urls: %w", err)
}

func errGetRoomPlayInfo(err error) error {
	return fmt.Errorf("failed to get room play info: %w", err)
}
