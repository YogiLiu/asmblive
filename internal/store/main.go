package store

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

// Store used to store data in a file. The generic type T is the type of data to be stored,
// and it must be a struct with json tag.
type Store[T any] interface {
	Read() (T, error)
	Write(T) error
}

type store[T any] struct {
	name string
	file string

	mtx sync.RWMutex
}

// New creates a new store. Notice: the name must be unique.
func New[T any](name string) Store[T] {
	dir := getStoreDir()
	file := filepath.Join(dir, name+".json")
	if _, err := os.Stat(file); os.IsNotExist(err) {
		if _, err := os.Create(file); err != nil {
			panic(fmt.Errorf("failed to create store file: %s, err: %w", file, err))
		}
	}
	return &store[T]{
		name: name,
		file: file,
	}
}

func (s *store[T]) Read() (T, error) {
	s.mtx.RLock()
	defer s.mtx.RUnlock()
	var c T
	data, err := os.ReadFile(s.file)
	if err != nil {
		return c, ErrRead(s.file, err)
	}
	if err = json.Unmarshal(data, &c); err != nil {
		return c, ErrUnmarshal(s.file, err)
	}
	return c, nil
}

func (s *store[T]) Write(c T) error {
	s.mtx.Lock()
	defer s.mtx.Unlock()
	data, err := json.Marshal(c)
	if err != nil {
		return ErrMarshal(s.name, err)
	}
	if err = os.WriteFile(s.file, data, 0600); err != nil {
		return ErrWrite(s.file, err)
	}
	return nil
}
