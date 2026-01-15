package internal

import (
	"fmt"
    "os"
    "path/filepath"
    "strings"
    "github.com/hymkor/trash-go"
)

// read

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


// create

func (a *App) CreateFile(relativePath string) (string, error) {
	if a.currentVault == "" {
		return "", fmt.Errorf("no vault opened")
	}
	
	fullPath := filepath.Join(a.currentVault, relativePath)
	
	if !strings.HasPrefix(fullPath, a.currentVault) {
		return "", fmt.Errorf("invalid path: outside vault")
	}

	if !strings.HasSuffix(fullPath, ".md") {
		fullPath += ".md"
	}
	
	dir := filepath.Dir(fullPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory: %w", err)
	}
	
	if err := os.WriteFile(fullPath, []byte(""), 0644); err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return fullPath, nil
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

// write

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

// delete

func (a *App) DeleteFile(relativePath string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}
	
	fullPath := filepath.Join(a.currentVault, relativePath)
	
	if !strings.HasPrefix(fullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}
	
	err := trash.Throw(fullPath)
	if err != nil {
		return fmt.Errorf("failed to move to trash: %w", err)
	}
	
	return nil
}

// rename 

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

// move

func (a *App) MoveFile(oldPath string, newPath string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}
	
	oldFullPath := filepath.Join(a.currentVault, oldPath)
	newFullPath := filepath.Join(a.currentVault, newPath)
	
	if !strings.HasPrefix(oldFullPath, a.currentVault) || !strings.HasPrefix(newFullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}
	
	newDir := filepath.Dir(newFullPath)
	if err := os.MkdirAll(newDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}
	
	return os.Rename(oldFullPath, newFullPath)
}