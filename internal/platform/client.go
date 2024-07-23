package platform

import (
	"errors"
	"log/slog"
	"net/http"
)

type Headers = map[string]string

type Client struct {
	log *slog.Logger
	hc  *http.Client
}

// NewClient returns a new instance of the Client.
// The parameter `h` is the default headers to be used for all requests.
func NewClient(l *slog.Logger, h Headers) *Client {
	l = l.With("module", "platform/client")
	tsp := roundTripper{h: h}
	hc := &http.Client{Transport: tsp}
	return &Client{log: l, hc: hc}
}

func (c Client) Do(req *http.Request) (*http.Response, error) {
	res, err := c.hc.Do(req)
	if err != nil {
		c.log.Error("request failed", "error", err)
		return nil, ErrRequest(err)
	}
	if res.StatusCode >= 400 {
		c.log.Error("request failed", "status", res.StatusCode)
		return nil, ErrRequest(errors.New("status code: " + res.Status))
	}
	return res, nil
}

type roundTripper struct {
	h Headers
}

func (r roundTripper) RoundTrip(req *http.Request) (*http.Response, error) {
	for k, v := range r.h {
		if oh := req.Header.Get(k); oh == "" {
			req.Header.Set(k, v)
		}
	}
	return http.DefaultTransport.RoundTrip(req)
}
