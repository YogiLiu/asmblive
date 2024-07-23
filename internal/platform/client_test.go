package platform

import (
	"github.com/stretchr/testify/assert"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestClient_Do(t *testing.T) {
	type fields struct {
		headers Headers
		status  int
		body    []byte
	}
	tests := []struct {
		name    string
		fields  fields
		want    []byte
		wantErr string
	}{
		{
			name: "should return response",
			fields: fields{
				headers: nil,
				status:  200,
				body:    []byte("test"),
			},
			want: []byte("test"),
		},
		{
			name: "should return 400 error",
			fields: fields{
				headers: nil,
				status:  400,
			},
			wantErr: "status code: 400",
		},
		{
			name: "should return 500 error",
			fields: fields{
				headers: nil,
				status:  500,
			},
			wantErr: "status code: 500",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(tt.fields.status)
				_, _ = w.Write(tt.fields.body)
			}))
			defer ts.Close()
			c := NewClient(slog.Default(), tt.fields.headers)
			req, err := http.NewRequest(http.MethodGet, ts.URL, nil)
			assert.NoError(t, err)
			got, err := c.Do(req)
			if tt.wantErr != "" {
				assert.ErrorContains(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			defer func() {
				err = got.Body.Close()
				assert.NoError(t, err)
			}()
			body, err := io.ReadAll(got.Body)
			assert.Equal(t, tt.want, body)
		})
	}
}
