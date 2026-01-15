package internal

import (
	"context"
)

type App struct {
	ctx          context.Context
	currentVault string
}

type FileInfo struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	IsDir    bool   `json:"isDir"`
	Modified string `json:"modified"`
}
