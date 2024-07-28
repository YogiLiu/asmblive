package store

import (
	"encoding/json"
	"github.com/stretchr/testify/assert"
	"os"
	"path/filepath"
	"runtime"
	"testing"
)

type mockConfig struct {
	FieldA string `json:"fieldA"`
	FieldB int    `json:"fieldB"`
}

func getMockDir() string {
	var dir string
	switch runtime.GOOS {
	case "windows":
		dir = filepath.Join(os.TempDir(), "test_asmblive")
		_ = os.Setenv("LOCALAPPDATA", dir)
		break
	default:
		dir = filepath.Join(os.TempDir(), "test_asmblive")
		_ = os.Setenv("HOME", dir)
	}
	return dir
}

func TestNew(t *testing.T) {
	dir := getMockDir()
	defer func() {
		_ = os.RemoveAll(dir)
	}()
	t.Run("should create the store file", func(t *testing.T) {
		_ = New[mockConfig]("test")
		f, err := os.Stat(filepath.Join(getStoreDir(), "test.json"))
		assert.NoError(t, err)
		assert.True(t, f.Mode().IsRegular())
	})
}

func TestStore_Read(t *testing.T) {
	dir := getMockDir()
	defer func() {
		_ = os.RemoveAll(dir)
	}()
	type testCase struct {
		name        string
		fileContent []byte
		want        mockConfig
		wantErr     string
	}
	tests := []testCase{
		{
			name:        "should return config",
			fileContent: []byte(`{"fieldA":"A","fieldB":123}`),
			want: mockConfig{
				FieldA: "A",
				FieldB: 123,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := New[mockConfig]("test")
			err := os.WriteFile(filepath.Join(getStoreDir(), "test.json"), tt.fileContent, 0600)
			assert.NoError(t, err)
			got, err := s.Read()
			if tt.wantErr != "" {
				assert.ErrorContains(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			assert.Equal(t, tt.want, got)
		})
	}
}

func TestStore_Write(t *testing.T) {
	dir := getMockDir()
	defer func() {
		_ = os.RemoveAll(dir)
	}()
	type args struct {
		c mockConfig
	}
	type testCase struct {
		name    string
		args    args
		wantErr string
	}
	tests := []testCase{
		{
			name: "should write config",
			args: args{c: mockConfig{FieldA: "A", FieldB: 123}},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := New[mockConfig]("test")
			err := s.Write(tt.args.c)
			if tt.wantErr != "" {
				assert.ErrorContains(t, err, tt.wantErr)
				return
			}
			assert.NoError(t, err)
			data, err := os.ReadFile(filepath.Join(getStoreDir(), "test.json"))
			assert.NoError(t, err)
			exp, _ := json.Marshal(tt.args.c)
			assert.Equal(t, exp, data)
		})
	}
}
