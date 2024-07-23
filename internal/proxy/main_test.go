package proxy

import (
	"github.com/stretchr/testify/assert"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"
)

// Waiting for the proxy server to start.
const waitTime = 1 * time.Second

func TestProxy_GetProxyUrl(t *testing.T) {
	type field struct {
		isRunning bool
		port      uint16
	}
	type args struct {
		origin string
	}
	tests := []struct {
		name    string
		field   field
		args    args
		want    string
		wantErr error
	}{
		{
			name: "should return proxy url",
			field: field{
				isRunning: true,
				port:      8080,
			},
			args: args{
				origin: "https://example.com",
			},
			want:    "http://127.0.0.1:8080?" + originQueryKey + "=" + url.QueryEscape("https://example.com"),
			wantErr: nil,
		},
		{
			name: "should return not running error",
			field: field{
				isRunning: false,
				port:      8080,
			},
			args: args{
				origin: "https://example.com",
			},
			want:    "",
			wantErr: ErrNotRunning,
		},
		{
			name: "should return invalid origin error",
			field: field{
				isRunning: false,
				port:      8080,
			},
			args: args{
				origin: "",
			},
			want:    "",
			wantErr: ErrInvalidOrigin,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			p := &Proxy{
				isRunning: tt.field.isRunning,
				port:      tt.field.port,
			}
			got, err := p.GetProxyUrl(func() url.URL {
				u, err := url.Parse(tt.args.origin)
				if err != nil {
					panic(err)
				}
				return *u
			}())
			if tt.wantErr != nil {
				assert.ErrorIs(t, err, tt.wantErr)
			} else {
				assert.NoError(t, err)
				assert.Equal(t, func() url.URL {
					u, err := url.Parse(tt.want)
					if err != nil {
						panic(err)
					}
					return *u
				}(), got)
			}
		})
	}
}

func TestProxy_Start_Stop(t *testing.T) {
	t.Run("should start", func(t *testing.T) {
		p := New(slog.Default())
		err := p.Start()
		defer func() {
			_ = p.Stop()
		}()
		time.Sleep(waitTime)
		assert.NoError(t, err)
		assert.Equal(t, true, p.isRunning)
		assert.NotEqual(t, uint16(0), p.port)
	})

	t.Run("should return error when already started", func(t *testing.T) {
		p := New(slog.Default())
		err := p.Start()
		defer func() {
			_ = p.Stop()
		}()
		time.Sleep(waitTime)
		pt := p.port

		err = p.Start()
		time.Sleep(waitTime)
		assert.ErrorIs(t, err, ErrAlreadyRunning)
		assert.Equal(t, true, p.isRunning)
		assert.Equal(t, pt, p.port)
	})

	t.Run("should stop", func(t *testing.T) {
		p := New(slog.Default())
		err := p.Start()
		time.Sleep(waitTime)

		err = p.Stop()
		time.Sleep(waitTime)
		assert.NoError(t, err)
		assert.Equal(t, false, p.isRunning)
		assert.Equal(t, uint16(0), p.port)
	})

	t.Run("should return error when already stopped", func(t *testing.T) {
		p := New(slog.Default())
		err := p.Start()
		time.Sleep(waitTime)
		err = p.Stop()
		time.Sleep(waitTime)
		err = p.Stop()
		time.Sleep(waitTime)
		assert.ErrorIs(t, err, ErrNotRunning)
		assert.Equal(t, false, p.isRunning)
		assert.Equal(t, uint16(0), p.port)
	})

	t.Run("should return proxy data", func(t *testing.T) {
		ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			_, _ = w.Write([]byte(r.Method + "\n" + r.URL.Path + "\n" + "data"))
		}))
		defer ts.Close()
		p := New(slog.Default())
		err := p.Start()
		defer func() {
			_ = p.Stop()
		}()
		assert.NoError(t, err)
		time.Sleep(waitTime)
		ou, _ := url.Parse(ts.URL)
		u, _ := p.GetProxyUrl(*ou)
		res, err := http.Get(u.String())
		assert.NoError(t, err)
		defer func() {
			_ = res.Body.Close()
		}()
		body, _ := io.ReadAll(res.Body)
		assert.Equal(t, []byte(http.MethodGet+"\n/\ndata"), body)
	})
}
