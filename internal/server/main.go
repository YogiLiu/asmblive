package server

import (
	"context"
	"errors"
	"log/slog"
	"net"
	"net/http"
	"net/url"
)

// Server is an HTTP server without any handler.
type Server interface {
	// Start starts the server, it must be called before Stop.
	Start() error

	// Stop stops the server, it must be called after Start.
	// It will block until the server is completely stopped.
	Stop(ctx context.Context) error

	// AddHandler adds a new handler to the server, it must be called before Start.
	AddHandler(pattern string, hf http.HandlerFunc)

	// BaseUrl returns the base URL of the server, it is valid after Start.
	BaseUrl() url.URL
}

func New(log *slog.Logger) Server {
	log = log.With("module", "server")
	return &server{
		log: log,
		hfs: make(map[string]http.HandlerFunc),
	}
}

// server is the implementation of Server.
type server struct {
	log     *slog.Logger
	srv     *http.Server
	baseUrl url.URL

	hfs map[string]http.HandlerFunc
}

func (s *server) BaseUrl() url.URL {
	return s.baseUrl
}

func (s *server) Start() error {
	// randomly choose a port
	l, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		return ErrServerStart(err)
	}
	s.baseUrl.Scheme = "http"
	s.baseUrl.Host = l.Addr().String()
	sm := http.NewServeMux()
	for pattern, hf := range s.hfs {
		sm.Handle(pattern, hf)
	}
	s.srv = &http.Server{Handler: sm}
	s.log.Info("server started", "addr", l.Addr())
	go func() {
		if err = s.srv.Serve(l); !errors.Is(http.ErrServerClosed, err) {
			s.log.Error("server error", "err", err)
		}
	}()
	return nil
}

func (s *server) Stop(ctx context.Context) error {
	if err := s.srv.Shutdown(ctx); !errors.Is(http.ErrServerClosed, err) && err != nil {
		return ErrServerStop(err)
	}
	return nil
}

func (s *server) AddHandler(pattern string, hf http.HandlerFunc) {
	s.hfs[pattern] = hf
}
