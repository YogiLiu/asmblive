package server

import (
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/stretchr/testify/assert"
)

func Test_corsProxy_ServeHTTP(t *testing.T) {
	t.Run("should return proxy response", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "example.com")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("test response"))
		}))
		defer ts.Close()
		u := url.URL{Scheme: "http", Host: "proxy.com", Path: corsPath}
		q := u.Query()
		q.Add(originKey, ts.URL)
		u.RawQuery = q.Encode()
		req, _ := http.NewRequest(http.MethodGet, u.String(), nil)
		w := httptest.NewRecorder()
		cp := corsProxy{log: slog.Default()}
		cp.ServeHTTP(w, req)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Equal(t, "test response", w.Body.String())
		assert.Equal(t, "", w.Header().Get("Access-Control-Allow-Origin"))
	})
}
