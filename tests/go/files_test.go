package tests

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"chalkmd/internal"
)

func TestReadFile(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		_, err := app.ReadFile("test.md")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("read existing file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		testContent := "Hello, World!"
		testFile := "test.md"
		os.WriteFile(filepath.Join(tempDir, testFile), []byte(testContent), 0644)
		
		content, err := app.ReadFile(testFile)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		if content != testContent {
			t.Errorf("Expected content '%s', got '%s'", testContent, content)
		}
	})
	
	t.Run("read non-existent file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		_, err := app.ReadFile("nonexistent.md")
		if err == nil {
			t.Error("Expected error for non-existent file")
		}
	})
	
	t.Run("path traversal attack", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		_, err := app.ReadFile("../../../etc/passwd")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
		if !strings.Contains(err.Error(), "outside vault") {
			t.Errorf("Expected 'outside vault' error, got %v", err)
		}
	})
}

func TestCreateFile(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		_, err := app.CreateFile("test.md")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("create file with .md extension", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		path, err := app.CreateFile("test.md")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		if !strings.HasSuffix(path, ".md") {
			t.Errorf("Expected .md extension, got %s", path)
		}
		
		if _, err := os.Stat(path); os.IsNotExist(err) {
			t.Error("File was not created")
		}
	})
	
	t.Run("auto-add .md extension", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		path, err := app.CreateFile("test")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		if !strings.HasSuffix(path, ".md") {
			t.Error("Expected .md extension to be added")
		}
	})
	
	t.Run("create file in nested directory", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		path, err := app.CreateFile("folder1/folder2/test.md")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		if _, err := os.Stat(path); os.IsNotExist(err) {
			t.Error("File and nested directories were not created")
		}
	})
	
	t.Run("path traversal attack", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		_, err := app.CreateFile("../../../tmp/evil.md")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
	})
}

func TestCreateFolder(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		err := app.CreateFolder("folder")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("create folder", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		err := app.CreateFolder("newfolder")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		folderPath := filepath.Join(tempDir, "newfolder")
		info, err := os.Stat(folderPath)
		if os.IsNotExist(err) {
			t.Error("Folder was not created")
		}
		if !info.IsDir() {
			t.Error("Created item is not a directory")
		}
	})
	
	t.Run("create nested folders", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		err := app.CreateFolder("folder1/folder2/folder3")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		folderPath := filepath.Join(tempDir, "folder1/folder2/folder3")
		if _, err := os.Stat(folderPath); os.IsNotExist(err) {
			t.Error("Nested folders were not created")
		}
	})
	
	t.Run("path traversal attack", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		err := app.CreateFolder("../../../tmp/evil")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
	})
}

func TestWriteFile(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		err := app.WriteFile("test.md", "content")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("write new file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		content := "Test content"
		err := app.WriteFile("test.md", content)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		filePath := filepath.Join(tempDir, "test.md")
		readContent, _ := os.ReadFile(filePath)
		if string(readContent) != content {
			t.Errorf("Expected '%s', got '%s'", content, string(readContent))
		}
	})
	
	t.Run("overwrite existing file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		filePath := filepath.Join(tempDir, "test.md")
		os.WriteFile(filePath, []byte("old content"), 0644)
		
		newContent := "new content"
		err := app.WriteFile("test.md", newContent)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		readContent, _ := os.ReadFile(filePath)
		if string(readContent) != newContent {
			t.Errorf("Expected '%s', got '%s'", newContent, string(readContent))
		}
	})
	
	t.Run("path traversal attack", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		err := app.WriteFile("../../../tmp/evil.md", "bad")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
	})
}

func TestRenameFile(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		err := app.RenameFile("old.md", "new.md")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("rename file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		oldPath := filepath.Join(tempDir, "old.md")
		os.WriteFile(oldPath, []byte("content"), 0644)
		
		err := app.RenameFile("old.md", "new.md")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		newPath := filepath.Join(tempDir, "new.md")
		if _, err := os.Stat(oldPath); !os.IsNotExist(err) {
			t.Error("Old file still exists")
		}
		if _, err := os.Stat(newPath); os.IsNotExist(err) {
			t.Error("New file does not exist")
		}
	})
	
	t.Run("path traversal attack on old path", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		err := app.RenameFile("../../../etc/passwd", "new.md")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
	})
	
	t.Run("path traversal attack on new path", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		os.WriteFile(filepath.Join(tempDir, "old.md"), []byte("content"), 0644)
		
		err := app.RenameFile("old.md", "../../../tmp/evil.md")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
	})
}

func TestMoveFile(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		err := app.MoveFile("file.md", "folder/file.md")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("move file to existing folder", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		oldPath := filepath.Join(tempDir, "file.md")
		os.WriteFile(oldPath, []byte("content"), 0644)
		os.Mkdir(filepath.Join(tempDir, "folder"), 0755)
		
		err := app.MoveFile("file.md", "folder/file.md")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		newPath := filepath.Join(tempDir, "folder/file.md")
		if _, err := os.Stat(oldPath); !os.IsNotExist(err) {
			t.Error("Old file still exists")
		}
		if _, err := os.Stat(newPath); os.IsNotExist(err) {
			t.Error("New file does not exist")
		}
	})
	
	t.Run("move file and create nested folders", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		oldPath := filepath.Join(tempDir, "file.md")
		os.WriteFile(oldPath, []byte("content"), 0644)
		
		err := app.MoveFile("file.md", "folder1/folder2/file.md")
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		newPath := filepath.Join(tempDir, "folder1/folder2/file.md")
		if _, err := os.Stat(newPath); os.IsNotExist(err) {
			t.Error("File was not moved to nested location")
		}
	})
	
	t.Run("path traversal attack", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		os.WriteFile(filepath.Join(tempDir, "file.md"), []byte("content"), 0644)
		
		err := app.MoveFile("file.md", "../../../tmp/evil.md")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
	})
}