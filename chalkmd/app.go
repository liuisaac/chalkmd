package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
	
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx         context.Context
	currentVault string
}

type FileInfo struct {
	Name     string `json:"name"`
	Path     string `json:"path"`
	IsDir    bool   `json:"isDir"`
	Modified string `json:"modified"`
}

func NewApp() *App {
	return &App{}
}

func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) SelectVaultFolder() (string, error) {
	folder, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Vault Folder",
	})
	if err != nil {
		return "", err
	}
	return folder, nil
}

func (a *App) OpenVault(path string) error {
	info, err := os.Stat(path)
	if err != nil {
		return fmt.Errorf("vault path not found: %w", err)
	}
	if !info.IsDir() {
		return fmt.Errorf("vault path must be a directory")
	}
	a.currentVault = path
	return nil
}

func (a *App) GetVaultPath() string {
	return a.currentVault
}

func (a *App) ListVaultContents() ([]FileInfo, error) {
	if a.currentVault == "" {
		return nil, fmt.Errorf("no vault opened")
	}
	
	var files []FileInfo
	err := filepath.Walk(a.currentVault, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		if strings.HasPrefix(info.Name(), ".") && path != a.currentVault {
			if info.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}
		
		if path == a.currentVault {
			return nil
		}
		
		relPath, _ := filepath.Rel(a.currentVault, path)
		
		files = append(files, FileInfo{
			Name:     info.Name(),
			Path:     relPath,
			IsDir:    info.IsDir(),
			Modified: info.ModTime().Format(time.RFC3339),
		})
		
		return nil
	})
	
	if err != nil {
		return nil, err
	}
	
	return files, nil
}

func (a *App) ReadFile(relativePath string) (string, error) {
	if a.currentVault == "" {
		return "", fmt.Errorf("no vault opened")
	}
	
	fullPath := filepath.Join(a.currentVault, relativePath)
	
	if !strings.HasPrefix(fullPath, a.currentVault) {
		return "", fmt.Errorf("invalid path: outside vault")
	}
	
	content, err := os.ReadFile(fullPath)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}
	
	return string(content), nil
}

func (a *App) WriteFile(relativePath string, content string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}
	
	fullPath := filepath.Join(a.currentVault, relativePath)
	
	if !strings.HasPrefix(fullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}
	
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}
	
	if err := os.WriteFile(fullPath, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}
	
	return nil
}

func (a *App) CreateFile(relativePath string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}
	
	fullPath := filepath.Join(a.currentVault, relativePath)
	
	if !strings.HasPrefix(fullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}
	
	if !strings.HasSuffix(fullPath, ".md") {
		fullPath += ".md"
	}
	
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}
	
	if err := os.WriteFile(fullPath, []byte(""), 0644); err != nil {
		return err
	}
	
	return nil
}

func (a *App) CreateFolder(relativePath string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}
	
	fullPath := filepath.Join(a.currentVault, relativePath)
	
	if !strings.HasPrefix(fullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}
	
	return os.MkdirAll(fullPath, 0755)
}

func (a *App) DeleteFile(relativePath string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}
	
	fullPath := filepath.Join(a.currentVault, relativePath)
	
	if !strings.HasPrefix(fullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}
	
	return os.RemoveAll(fullPath)
}

func (a *App) RenameFile(oldPath string, newPath string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}
	
	oldFullPath := filepath.Join(a.currentVault, oldPath)
	newFullPath := filepath.Join(a.currentVault, newPath)
	
	if !strings.HasPrefix(oldFullPath, a.currentVault) || !strings.HasPrefix(newFullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}
	
	return os.Rename(oldFullPath, newFullPath)
}