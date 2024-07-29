package main

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
)

func TestVersion(t *testing.T) {
	t.Run("should return correct version", func(t *testing.T) {
		j, _ := os.ReadFile(".cz.json")
		var cz map[string]any
		_ = json.Unmarshal(j, &cz)
		c := cz["commitizen"].(map[string]any)
		assert.Equal(t, c["version"], version{}.GetVersion())
	})
}
