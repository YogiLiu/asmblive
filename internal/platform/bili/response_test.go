package bili

import (
	"asmblive/internal/platform"
	"github.com/stretchr/testify/assert"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
)

type testData struct {
	A int    `json:"a"`
	B string `json:"b"`
}

func Test_biliClient_getJson(t *testing.T) {
	type fields struct {
		body        []byte
		contentType string
	}
	tests := []struct {
		name    string
		fields  fields
		want    *testData
		wantErr string
	}{
		{
			name: "should return json data",
			fields: fields{
				body:        []byte(`{"code": 0, "message": "", "data": {"a": 1, "b": "2"}}`),
				contentType: "application/json;charset=utf-8",
			},
			want: &testData{
				A: 1,
				B: "2",
			},
		},
		{
			name:    "should return content type error",
			fields:  fields{contentType: "text/html"},
			wantErr: "unexpected content type: text/html",
		},
		{
			name: "should return parse error",
			fields: fields{
				contentType: "application/json;charset=utf-8",
				body:        []byte("{ invalid json"),
			},
			wantErr: "failed to decode response body",
		},
		{
			name: "should return code error",
			fields: fields{
				contentType: "application/json;charset=utf-8",
				body:        []byte(`{"code": 1, "message": "failed", "data": {"a": 1, "b": "2"}}`),
			},
			wantErr: "unexpected response code: 1, message: failed",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ts := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", tt.fields.contentType)
				w.WriteHeader(http.StatusOK)
				_, _ = w.Write(tt.fields.body)
			}))
			c := biliClient[testData]{
				Client: platform.NewClient(slog.Default(), platform.Headers{}),
				log:    slog.Default(),
			}
			req, _ := http.NewRequest(http.MethodGet, ts.URL, nil)
			got, err := c.getJson(req)
			if tt.wantErr != "" {
				assert.ErrorContains(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}
