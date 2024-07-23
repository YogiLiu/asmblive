package proxy

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"net"
	"net/http"
	"net/url"
	"strconv"
	"sync"
	"text/template"
	"time"
)

// Use to stop the proxy server.
type stopSignal int8

const (
	// Default proxy HTTP port, it will be incremented if it is already used.
	defaultPort uint16 = 11451

	stopSignalValue stopSignal = 0

	resendTimeout = 5 * time.Second

	userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

	originQueryKey = "origin"
)

var (
	errTmpl *template.Template

	copyHeaders = [...]string{
		"Content-Type",
		"Accept", "Accept-Language", "Accept-Encoding",
		"Cache-Control", "If-None-Match", "If-Modified-Since",
	}
)

func init() {
	errTmplText := "{\"error\": \"{{.}}\"}"
	errTmpl = template.Must(template.New("error").Parse(errTmplText))
}

// Proxy use to generate a http proxy service.
// It can generate a proxy URL for the given origin URL
// and resend the request to the origin URL.
// It is useful for some URLs that can not be accessed directly
// since CORS policy or something.
type Proxy struct {
	logger *slog.Logger
	ch     chan stopSignal

	mtx       sync.RWMutex
	isRunning bool
	port      uint16
}

func New(l *slog.Logger) *Proxy {
	l = l.With("module", "proxy")
	return &Proxy{
		logger:    l,
		isRunning: false,
		ch:        make(chan stopSignal),
	}
}

// GetProxyUrl returns the proxy url for the given origin URL.
// The format of the proxy URL like "http://127.0.0.1:8000/?origin=encoded_origin_url".
func (p *Proxy) GetProxyUrl(origin url.URL) (url.URL, error) {
	s := origin.String()
	if s == "" {
		return url.URL{}, ErrInvalidOrigin
	}
	p.mtx.RLock()
	if !p.isRunning {
		p.mtx.RUnlock()
		return url.URL{}, ErrNotRunning
	}
	p.mtx.RUnlock()
	u := url.URL{
		Scheme: "http",
		Host:   "127.0.0.1:" + strconv.Itoa(int(p.port)),
	}
	q := u.Query()
	q.Set(originQueryKey, origin.String())
	u.RawQuery = q.Encode()
	return u, nil
}

// Start will start a local HTTP server.
// The server will listen on a random port.
func (p *Proxy) Start() error {
	p.mtx.RLock()
	if p.isRunning {
		p.mtx.RUnlock()
		return ErrAlreadyRunning
	}
	p.mtx.RUnlock()
	port := defaultPort
	listener, err := net.Listen("tcp", "127.0.0.1:"+strconv.Itoa(int(port)))
	for err != nil {
		port = port + 1
		listener, err = net.Listen("tcp", "127.0.0.1:"+strconv.Itoa(int(port)))
	}
	mux := p.createServeMux()
	go func() {
		var srv http.Server
		srv.Handler = mux
		go func() {
			<-p.ch
			ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
			defer cancel()
			if err = srv.Shutdown(ctx); err != nil {
				p.logger.Error("cannot shutdown proxy server", "err", err)
			}
			close(p.ch)
			p.mtx.Lock()
			p.isRunning = false
			p.port = 0
			p.mtx.Unlock()
			p.logger.Info("proxy server stopped")
		}()
		p.mtx.Lock()
		p.port = port
		p.isRunning = true
		p.mtx.Unlock()
		p.logger.Info("starting proxy server", "port", p.port)
		if err = srv.Serve(listener); err != nil {
			p.logger.Warn("proxy server stop", "err", err)
			return
		}
	}()
	return nil
}

func (p *Proxy) createServeMux() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		o := req.URL.Query().Get(originQueryKey)
		if o == "" {
			p.logger.Warn("origin query is empty")
			p.writeError(ErrInvalidOrigin, http.StatusBadRequest, w)
			return
		}
		u, err := url.Parse(o)
		if err != nil {
			p.logger.Warn("cannot parse origin url", "decoded_url", o, "err", err)
			p.writeError(err, http.StatusUnprocessableEntity, w)
		}
		if err = p.resend(*u, req, w); err != nil {
			p.logger.Error("cannot resend the request", "err", err)
			p.writeError(err, http.StatusInternalServerError, w)
		}
	})
	return mux
}

func (p *Proxy) resend(u url.URL, or *http.Request, w http.ResponseWriter) error {
	ctx, cancel := context.WithTimeout(context.Background(), resendTimeout)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, or.Method, u.String(), or.Body)
	if err != nil {
		return err
	}
	req.Header.Set("User-Agent", userAgent)
	for _, header := range copyHeaders {
		if oh := or.Header.Get(header); oh != "" {
			req.Header.Set(header, oh)
		}
	}
	p.logger.Info("resending request", "url", u.String())
	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer func() {
		if err = res.Body.Close(); err != nil {
			p.logger.Warn("cannot close response body", "err", err)
		}
	}()
	written, err := io.Copy(w, res.Body)
	if err != nil {
		return err
	}
	p.logger.Info("request resent", "url", u.String(), "written", written)
	return nil
}

func (p *Proxy) writeError(err error, status int, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	buf := bytes.Buffer{}
	if err := errTmpl.Execute(&buf, err.Error()); err != nil {
		p.logger.Error("cannot execute error template", "err", err)
		return
	}
	if _, err = w.Write(buf.Bytes()); err != nil {
		p.logger.Error("cannot write the error response", "err", err)
	}
}

// Stop will stop the local proxy HTTP server.
func (p *Proxy) Stop() error {
	p.mtx.RLock()
	if !p.isRunning {
		p.mtx.RUnlock()
		return ErrNotRunning
	}
	p.mtx.RUnlock()
	p.ch <- stopSignalValue
	return nil
}
