package bili

import (
	"github.com/stretchr/testify/assert"
	"log/slog"
	"testing"
)

func TestNewBili(t *testing.T) {
	t.Run("should return an id", func(t *testing.T) {
		bili := NewBili(slog.Default(), nil, nil)
		assert.Equal(t, "bili", bili.Id())
	})

	t.Run("should return a name", func(t *testing.T) {
		bili := NewBili(slog.Default(), nil, nil)
		assert.Equal(t, "哔哩哔哩直播", bili.Name())
	})

	t.Run("should return an icon", func(t *testing.T) {
		bili := NewBili(slog.Default(), nil, nil)
		u := bili.IconUrl()
		assert.Equal(t, "https://www.bilibili.com/favicon.ico", u.String())
	})
}
