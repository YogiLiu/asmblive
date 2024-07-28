package store

import "fmt"

var ErrRead = func(file string, err error) error {
	return fmt.Errorf("cannot not read file %s: %w", file, err)
}

var ErrWrite = func(file string, err error) error {
	return fmt.Errorf("cannot not write file %s: %w", file, err)
}

var ErrUnmarshal = func(file string, err error) error {
	return fmt.Errorf("cannot not unmarshal file %s: %w", file, err)
}

var ErrMarshal = func(name string, err error) error {
	return fmt.Errorf("cannot not marshal config %s: %w", name, err)
}
