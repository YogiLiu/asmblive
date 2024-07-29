package main

import (
	_ "embed"
	"encoding/json"
)

//go:embed .cz.json
var czStr string

var v string

func init() {
	cz := map[string]any{}
	err := json.Unmarshal([]byte(czStr), &cz)
	if err != nil {
		panic(err)
	}
	c := cz["commitizen"].(map[string]any)
	v = c["version"].(string)
}

type version struct {
}

func (vs version) GetVersion() string {
	return v
}
