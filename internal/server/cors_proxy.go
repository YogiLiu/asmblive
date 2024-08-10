package server

import (
	"fmt"
	"io"
	"log/slog"
	"net/http"
)

const corsHeadersPrefix = "access-control-"
const originKey = "origin"

type corsProxy struct {
	log *slog.Logger
}

func (c corsProxy) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	origin := req.URL.Query().Get(originKey)
	if origin == "" {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "origin is required"}`))
		c.log.Error("origin is required")
		return
	}
	newReq, err := http.NewRequestWithContext(req.Context(), req.Method, origin, req.Body)
	if err != nil {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(fmt.Sprintf(`{"error": "%s"}`, err.Error())))
		c.log.Error("cannot create new request", "error", err)
		return
	}
	res, err := http.DefaultClient.Do(newReq)
	if err != nil {
		w.Header().Add("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(fmt.Sprintf(`{"error": "%s"}`, err.Error())))
		c.log.Error("cannot do request", "error", err)
		return
	}
	defer func() {
		err = res.Body.Close()
		c.log.Error("failed to close response body", "error", err)
	}()
	for key, values := range res.Header {
		// remove cors response headers
		if len(key) > len(corsHeadersPrefix) && key[0:len(corsHeadersPrefix)] != corsHeadersPrefix {
			continue
		}
		for _, value := range values {
			w.Header().Add(key, value)
		}
	}
	w.WriteHeader(res.StatusCode)
	l, err := io.Copy(w, res.Body)
	if err != nil {
		c.log.Error("failed to copy response body", "error", err)
	} else {
		c.log.Info("copied response body", "length", l)
	}
}
