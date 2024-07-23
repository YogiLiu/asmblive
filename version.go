package main

import (
	_ "embed"
	"encoding/json"
)

//go:embed .cz.json
var czStr string

var version string

func init() {
	cz := map[string]any{}
	err := json.Unmarshal([]byte(czStr), &cz)
	if err != nil {
		panic(err)
	}
	c := cz["commitizen"].(map[string]any)
	version = c["version"].(string)
}

func Version() string {
	return version
}
