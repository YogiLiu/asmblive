package store

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
)

// getStoreDir returns the directory where the store should be stored,
// it will create the directory if it doesn't exist.
func getStoreDir() string {
	var dir string
	switch runtime.GOOS {
	case "windows":
		lad := os.Getenv("LOCALAPPDATA")
		if lad == "" {
			panic(fmt.Errorf("LOCALAPPDATA environment variable not set"))
		}
		dir = filepath.Join(lad, "Asmblive", "Store")
		break
	case "darwin":
		home := os.Getenv("HOME")
		if home == "" {
			panic(fmt.Errorf("HOME environment variable not set"))
		}
		dir = filepath.Join(home, "Library", "Asmblive", "Store")
		break
	case "linux":
		home := os.Getenv("HOME")
		if home == "" {
			panic(fmt.Errorf("HOME environment variable not set"))
		}
		dir = filepath.Join(home, ".config", "asmblive", "store")
		break
	default:
		panic(fmt.Errorf("unsupported os for store: %s", runtime.GOOS))
	}
	// 0700 represent the dir can be read, write and execute by the owner only
	if err := os.MkdirAll(dir, 0700); err != nil {
		panic(fmt.Errorf("failed to create store directory: %s, err: %w", dir, err))
	}
	return dir
}
