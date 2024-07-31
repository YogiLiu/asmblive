package service

import (
	"errors"
	"github.com/stretchr/testify/assert"
	"log/slog"
	"testing"
)

type mockStore struct {
	read  func() ([]BoardDTO, error)
	write func([]BoardDTO) error
}

func (m mockStore) Read() ([]BoardDTO, error) {
	return m.read()
}

func (m mockStore) Write(t []BoardDTO) error {
	return m.write(t)
}

func TestBoardService_GetBoards(t *testing.T) {
	type fields struct {
		s mockStore
	}
	tests := []struct {
		name   string
		fields fields
		want   []BoardDTO
	}{
		{
			name: "should return boards",
			fields: fields{s: mockStore{read: func() ([]BoardDTO, error) {
				return []BoardDTO{
					{
						Id:   "1",
						Name: "board1",
					},
					{
						Id:   "2",
						Name: "board2",
					},
				}, nil
			}}},
			want: []BoardDTO{
				{
					Id:   "1",
					Name: "board1",
				},
				{
					Id:   "2",
					Name: "board2",
				},
			},
		},
		{
			name: "should return empty slice since error",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) {
					return []BoardDTO{}, errors.New("error")
				},
			}},
			want: []BoardDTO{},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := BoardService{
				log: slog.Default(),
				s:   tt.fields.s,
			}
			assert.Equal(t, tt.want, s.GetBoards())
		})
	}
}

func TestBoardService_GetBoard(t *testing.T) {
	type fields struct {
		s mockStore
	}
	type args struct {
		bId string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *BoardDTO
	}{

		{
			name: "should return board",
			fields: fields{s: mockStore{read: func() ([]BoardDTO, error) {
				return []BoardDTO{
					{
						Id:   "1",
						Name: "board1",
					},
					{
						Id:   "2",
						Name: "board2",
					},
				}, nil
			}}},
			args: args{bId: "1"},
			want: &BoardDTO{
				Id:   "1",
				Name: "board1",
			},
		},
		{

			name: "should return nil since error",
			fields: fields{s: mockStore{read: func() ([]BoardDTO, error) {
				return []BoardDTO{}, errors.New("error")
			}}},
			args: args{bId: "1"},
			want: nil,
		},
		{
			name: "should return nil since board not found",
			fields: fields{s: mockStore{read: func() ([]BoardDTO, error) {
				return []BoardDTO{}, nil
			}}},
			args: args{bId: "1"},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := BoardService{
				log: slog.Default(),
				s:   tt.fields.s,
			}
			assert.Equal(t, tt.want, s.GetBoard(tt.args.bId))
		})
	}
}

func TestBoardService_AddBoard(t *testing.T) {
	type fields struct {
		s mockStore
	}
	type args struct {
		b BoardDTO
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *BoardDTO
	}{
		{
			name: "should return boards",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) {
					return []BoardDTO{}, nil
				},
				write: func(bs []BoardDTO) error {
					assert.Equal(t, []BoardDTO{{Id: "1", Name: "board1"}}, bs)
					return nil
				},
			}},
			args: args{b: BoardDTO{Id: "1", Name: "board1"}},
			want: &BoardDTO{
				Id:   "1",
				Name: "board1",
			},
		},
		{
			name: "should return empty slice since read error",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) {
					return nil, errors.New("error")
				},
			}},
			args: args{b: BoardDTO{Id: "1", Name: "board1"}},
			want: nil,
		},
		{
			name: "should return empty slice since write error",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) {
					return []BoardDTO{}, nil
				},
				write: func(bs []BoardDTO) error {
					assert.Equal(t, []BoardDTO{{Id: "1", Name: "board1"}}, bs)
					return errors.New("error")
				},
			}},
			args: args{b: BoardDTO{Id: "1", Name: "board1"}},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := BoardService{
				log: slog.Default(),
				s:   tt.fields.s,
			}
			assert.Equal(t, tt.want, s.AddBoard(tt.args.b))
		})
	}
}

func TestBoardService_RemoveBoard(t *testing.T) {
	type fields struct {
		s mockStore
	}
	type args struct {
		bId string
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *BoardDTO
	}{
		{
			name: "should return board",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) {
					return []BoardDTO{
						{
							Id:   "1",
							Name: "board1",
						},
						{
							Id:   "2",
							Name: "board2",
						},
					}, nil
				},
				write: func(bs []BoardDTO) error {
					assert.Equal(t, []BoardDTO{
						{
							Id:   "2",
							Name: "board2",
						},
					}, bs)
					return nil
				},
			}},
			args: args{bId: "1"},
			want: &BoardDTO{Id: "1", Name: "board1"},
		},
		{
			name:   "should return nil since read error",
			fields: fields{s: mockStore{read: func() ([]BoardDTO, error) { return nil, errors.New("error") }}},
			args:   args{bId: "1"},
			want:   nil,
		},
		{
			name: "should return nil since write error",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) {
					return []BoardDTO{
						{
							Id:   "1",
							Name: "board1",
						},
						{
							Id:   "2",
							Name: "board2",
						},
					}, nil
				},
				write: func(bs []BoardDTO) error {
					return errors.New("error")
				},
			}},
			args: args{bId: "1"},
			want: nil,
		},
		{
			name: "should return nil since not found",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) {
					return []BoardDTO{
						{
							Id:   "1",
							Name: "board1",
						},
						{
							Id:   "2",
							Name: "board2",
						},
					}, nil
				},
				write: func(bs []BoardDTO) error {
					return nil
				},
			}},
			args: args{bId: "3"},
			want: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := BoardService{
				log: slog.Default(),
				s:   tt.fields.s,
			}
			assert.Equal(t, tt.want, s.RemoveBoard(tt.args.bId))
		})
	}
}

func TestBoardService_UpdateBoard(t *testing.T) {
	type fields struct {
		s mockStore
	}
	type args struct {
		nb BoardDTO
	}
	tests := []struct {
		name   string
		fields fields
		args   args
		want   *BoardDTO
	}{
		{
			name: "should return board",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) { return []BoardDTO{{Id: "1", Name: "board1"}}, nil },
				write: func(bs []BoardDTO) error {
					assert.Equal(t, []BoardDTO{{Id: "1", Name: "newBoard1"}}, bs)
					return nil
				},
			}},
			args: args{nb: BoardDTO{Id: "1", Name: "newBoard1"}},
			want: &BoardDTO{Id: "1", Name: "newBoard1"},
		},
		{
			name:   "should return nil since read error",
			fields: fields{s: mockStore{read: func() ([]BoardDTO, error) { return nil, errors.New("error") }}},
			want:   nil,
		},
		{
			name: "should return nil since write error",
			fields: fields{s: mockStore{
				read: func() ([]BoardDTO, error) { return []BoardDTO{{Id: "1", Name: "board1"}}, nil },
				write: func(bs []BoardDTO) error {
					assert.Equal(t, []BoardDTO{{Id: "1", Name: "newBoard1"}}, bs)
					return errors.New("error")
				},
			}},
			args: args{nb: BoardDTO{Id: "1", Name: "newBoard1"}},
			want: nil,
		},
		{
			name:   "should return nil since not found",
			fields: fields{s: mockStore{read: func() ([]BoardDTO, error) { return []BoardDTO{{Id: "1", Name: "board1"}}, nil }}},
			args:   args{nb: BoardDTO{Id: "2", Name: "newBoard2"}},
			want:   nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := BoardService{
				log: slog.Default(),
				s:   tt.fields.s,
			}
			assert.Equalf(t, tt.want, s.UpdateBoard(tt.args.nb), "UpdateBoard(%v)", tt.args.nb)
		})
	}
}
