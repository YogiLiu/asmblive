package server

import (
	"context"
	"github.com/stretchr/testify/assert"
	"log/slog"
	"net"
	"net/http"
	"testing"
)

func Test_server_Start_Stop(t *testing.T) {
	type fields struct {
		hfs map[string]http.HandlerFunc
	}
	tests := []struct {
		name    string
		fields  fields
		wantErr string
	}{
		{
			name: "should start and stop the server",
			fields: fields{
				hfs: map[string]http.HandlerFunc{
					"/test": http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {
						w.WriteHeader(http.StatusOK)
					}),
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &server{
				log: slog.Default(),
				hfs: tt.fields.hfs,
			}
			err := s.Start()
			if tt.wantErr != "" {
				assert.ErrorContains(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			u := s.BaseUrl()
			u.Path = u.Path + "/test"
			res, err := http.Get(u.String())
			assert.NoError(t, err)
			assert.Equal(t, http.StatusOK, res.StatusCode)
			err = s.Stop(context.Background())
			assert.NoError(t, err)
			_, err = net.Listen("tcp", u.Host)
			assert.NoError(t, err)
		})
	}
}

func Test_server_AddHandler(t *testing.T) {
	t.Run("should add handler", func(t *testing.T) {
		s := server{hfs: make(map[string]http.HandlerFunc)}
		assert.NotNil(t, s.hfs)

		s.AddHandler("/test1", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {}))
		assert.Len(t, s.hfs, 1)

		s.AddHandler("/test1", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {}))
		assert.Len(t, s.hfs, 1)

		s.AddHandler("/test2", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {}))
		assert.Len(t, s.hfs, 2)
	})
}

func TestNew(t *testing.T) {
	t.Run("should create a valid server", func(t *testing.T) {
		s := New(slog.Default())
		assert.NotNil(t, s)
		assert.NotPanics(t, func() {
			s.AddHandler("/test", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) {}))
		})
	})
}