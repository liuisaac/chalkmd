package internal

import (
    "fmt"
    "os"
    "path/filepath"
    "strings"
    "time"
    "github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) GetVaultPath() string {
	return a.currentVault
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

func (a *App) SelectVaultFolder() (string, error) {
	folder, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Vault Folder",
	})
	if err != nil {
		return "", err
	}
	return folder, nil
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