package bili

import (
	"asmblive/internal/platform"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
)

type biliClient[T any] struct {
	*platform.Client
	log *slog.Logger
}

func (c biliClient[T]) getJson(req *http.Request) (*T, error) {
	res, err := c.Do(req)
	if err != nil {
		return nil, platform.ErrRequest(err)
	}
	defer func() {
		if err := res.Body.Close(); err != nil {
			c.log.Warn("failed to close response body", "error", err)
		}
	}()
	ct := res.Header.Get("Content-Type")
	if !strings.Contains(ct, "application/json") {
		return nil, platform.ErrRequest(fmt.Errorf("unexpected content type: %s", ct))
	}
	var rb response[T]
	if err := json.NewDecoder(res.Body).Decode(&rb); err != nil {
		c.log.Error("failed to decode response body", "error", err)
		return nil, platform.ErrRequest(fmt.Errorf("failed to decode response body: %w", err))
	}
	if rb.Code != 0 {
		return nil, platform.ErrRequest(fmt.Errorf("unexpected response code: %d, message: %s", rb.Code, rb.Message))
	}
	return &rb.Data, nil
}

type response[T any] struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Data    T      `json:"data"`
}
