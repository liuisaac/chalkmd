package tests

import (
	"os"
	"path/filepath"
	"testing"
	"chalkmd/internal"
)

func TestGetVaultPath(t *testing.T) {
	app := &internal.App{}
	
	if app.GetVaultPath() != "" {
		t.Error("Expected empty vault path for new app")
	}
}

func TestOpenVault(t *testing.T) {
	t.Run("valid directory", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		
		err := app.OpenVault(tempDir)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		if app.GetVaultPath() != tempDir {
			t.Errorf("Expected vault path %s, got %s", tempDir, app.GetVaultPath())
		}
	})
	
	t.Run("non-existent path", func(t *testing.T) {
		app := &internal.App{}
		err := app.OpenVault("/nonexistent/path/12345")
		if err == nil {
			t.Error("Expected error for non-existent path")
		}
	})
	
	t.Run("file instead of directory", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		tempFile := filepath.Join(tempDir, "test.txt")
		os.WriteFile(tempFile, []byte("test"), 0644)
		
		err := app.OpenVault(tempFile)
		if err == nil {
			t.Error("Expected error when opening a file as vault")
		}
	})
}

func TestListVaultContents(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		_, err := app.ListVaultContents()
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("empty vault", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		files, err := app.ListVaultContents()
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		if len(files) != 0 {
			t.Errorf("Expected 0 files, got %d", len(files))
		}
	})
	
	t.Run("vault with files and folders", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		// Create test structure
		os.WriteFile(filepath.Join(tempDir, "file1.md"), []byte("test"), 0644)
		os.WriteFile(filepath.Join(tempDir, "file2.txt"), []byte("test"), 0644)
		os.Mkdir(filepath.Join(tempDir, "folder1"), 0755)
		os.WriteFile(filepath.Join(tempDir, "folder1", "nested.md"), []byte("test"), 0644)
		
		files, err := app.ListVaultContents()
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		if len(files) != 4 {
			t.Errorf("Expected 4 items, got %d", len(files))
		}
		
		// Check for folder
		hasFolder := false
		for _, f := range files {
			if f.Name == "folder1" && f.IsDir {
				hasFolder = true
				break
			}
		}
		if !hasFolder {
			t.Error("Expected folder1 to be in results")
		}
	})
	
	t.Run("hidden files are ignored", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		os.WriteFile(filepath.Join(tempDir, ".hidden"), []byte("test"), 0644)
		os.WriteFile(filepath.Join(tempDir, "visible.md"), []byte("test"), 0644)
		os.Mkdir(filepath.Join(tempDir, ".hiddendir"), 0755)
		
		files, err := app.ListVaultContents()
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		for _, f := range files {
			if f.Name[0] == '.' {
				t.Errorf("Hidden file/folder %s should be ignored", f.Name)
			}
		}
		
		if len(files) != 1 {
			t.Errorf("Expected 1 visible file, got %d", len(files))
		}
	})
}