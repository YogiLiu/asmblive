package setting

import (
	"github.com/stretchr/testify/assert"
	"log/slog"
	"testing"
)

type mockStore struct {
	readReturn map[string]string
	readErr    error
	writeFunc  func(map[string]string) error
}

func (m mockStore) Read() (map[string]string, error) {
	return m.readReturn, m.readErr
}

func (m mockStore) Write(s map[string]string) error {
	return m.writeFunc(s)
}

func TestBili_GetBiliCookie(t *testing.T) {
	type fields struct {
		Store mockStore
	}
	tests := []struct {
		name   string
		fields fields
		want   string
	}{
		{
			name: "should return cookie",
			fields: fields{Store: mockStore{
				readReturn: map[string]string{
					biliCookieKey: "test_cookie",
				},
			}},
			want: "test_cookie",
		},
		{
			name: "should return empty since not existing",
			fields: fields{Store: mockStore{
				readReturn: map[string]string{},
			}},
			want: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := Bili{
				Store: tt.fields.Store,
				Log:   slog.Default(),
			}
			got := b.GetBiliCookie()
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestBili_SetBiliCookie(t *testing.T) {
	type fields struct {
		Store mockStore
	}
	type args struct {
		cookie string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   string
	}{
		{
			name: "should set cookie",
			fields: fields{Store: mockStore{
				readReturn: make(map[string]string),
				writeFunc: func(m map[string]string) error {
					assert.Equal(t, 1, len(m))
					assert.Equal(t, m, map[string]string{biliCookieKey: "test_cookie"})
					return nil
				},
			}},
			args: args{
				cookie: "test_cookie",
			},
			want: "test_cookie",
		},
		{
			name: "should set empty cookie",
			fields: fields{Store: mockStore{
				readReturn: make(map[string]string),
				writeFunc: func(m map[string]string) error {
					assert.Equal(t, 1, len(m))
					assert.Equal(t, m, map[string]string{biliCookieKey: ""})
					return nil
				},
			}},
			args: args{
				cookie: "",
			},
			want: "",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			b := Bili{
				Store: tt.fields.Store,
				Log:   slog.Default(),
			}
			c := b.SetBiliCookie(tt.args.cookie)
			assert.Equal(t, tt.want, c)
		})
	}
}
