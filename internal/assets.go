package internal

import (
	"encoding/base64"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func (a *App) ReadBinaryFile(relativePath string) (string, error) {
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

	return base64.StdEncoding.EncodeToString(content), nil
}

func (a *App) WriteBinaryFile(relativePath string, base64Data string) error {
	if a.currentVault == "" {
		return fmt.Errorf("no vault opened")
	}

	fullPath := filepath.Join(a.currentVault, relativePath)

	if !strings.HasPrefix(fullPath, a.currentVault) {
		return fmt.Errorf("invalid path: outside vault")
	}

	data, err := base64.StdEncoding.DecodeString(base64Data)
	if err != nil {
		return fmt.Errorf("failed to decode base64 data: %w", err)
	}

	return os.WriteFile(fullPath, data, 0644)
}