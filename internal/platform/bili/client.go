package bili

import (
	"asmblive/internal/platform"
	"asmblive/internal/setting"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"strings"
)

var commonHeaders = map[string]string{
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36 OPR/79.0.4143.50",
}

type biliClient[T any] struct {
	platform.Client
	log *slog.Logger
	st  *setting.Bili
}

func (c biliClient[T]) getJson(req *http.Request) (*T, error) {
	for k, v := range commonHeaders {
		req.Header.Set(k, v)
	}
	if c.st != nil {
		ck := c.st.GetBiliCookie()
		if ck != "" {
			req.Header.Set("Cookie", ck)
			c.log.Info("use cookie for bilibili", "host", req.URL.Host, "path", req.URL.Path)
		}
	}
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
