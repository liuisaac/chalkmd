package tests

import (
	"encoding/base64"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"chalkmd/internal"
)

func TestReadBinaryFile(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		_, err := app.ReadBinaryFile("image.png")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("read binary file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		testData := []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
		testFile := "test.png"
		os.WriteFile(filepath.Join(tempDir, testFile), testData, 0644)
		
		result, err := app.ReadBinaryFile(testFile)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		decoded, err := base64.StdEncoding.DecodeString(result)
		if err != nil {
			t.Errorf("Failed to decode base64: %v", err)
		}
		
		if string(decoded) != string(testData) {
			t.Errorf("Expected %v, got %v", testData, decoded)
		}
	})
	
	t.Run("read non-existent file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		_, err := app.ReadBinaryFile("nonexistent.png")
		if err == nil {
			t.Error("Expected error for non-existent file")
		}
	})
	
	t.Run("path traversal attack", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		_, err := app.ReadBinaryFile("../../../etc/passwd")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
		if !strings.Contains(err.Error(), "outside vault") {
			t.Errorf("Expected 'outside vault' error, got %v", err)
		}
	})
	
	t.Run("read large binary file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		testData := make([]byte, 1024)
		for i := range testData {
			testData[i] = byte(i % 256)
		}
		testFile := "large.bin"
		os.WriteFile(filepath.Join(tempDir, testFile), testData, 0644)
		
		result, err := app.ReadBinaryFile(testFile)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		decoded, _ := base64.StdEncoding.DecodeString(result)
		if len(decoded) != len(testData) {
			t.Errorf("Expected length %d, got %d", len(testData), len(decoded))
		}
	})
}

func TestWriteBinaryFile(t *testing.T) {
	t.Run("no vault opened", func(t *testing.T) {
		app := &internal.App{}
		err := app.WriteBinaryFile("test.png", "dGVzdA==")
		if err == nil {
			t.Error("Expected error when no vault is opened")
		}
	})
	
	t.Run("write binary file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		testData := []byte("Hello, Binary!")
		base64Data := base64.StdEncoding.EncodeToString(testData)
		
		err := app.WriteBinaryFile("test.bin", base64Data)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		// Verify file was written correctly
		filePath := filepath.Join(tempDir, "test.bin")
		readData, _ := os.ReadFile(filePath)
		if string(readData) != string(testData) {
			t.Errorf("Expected %s, got %s", string(testData), string(readData))
		}
	})
	
	t.Run("write binary file in nested directory", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		testData := []byte{0x01, 0x02, 0x03, 0x04}
		base64Data := base64.StdEncoding.EncodeToString(testData)
		
		// Create parent directory
		os.MkdirAll(filepath.Join(tempDir, "images"), 0755)
		
		err := app.WriteBinaryFile("images/test.png", base64Data)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		filePath := filepath.Join(tempDir, "images/test.png")
		if _, err := os.Stat(filePath); os.IsNotExist(err) {
			t.Error("File was not created in nested directory")
		}
	})
	
	t.Run("invalid base64 data", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		err := app.WriteBinaryFile("test.bin", "not-valid-base64!!!")
		if err == nil {
			t.Error("Expected error for invalid base64 data")
		}
		if !strings.Contains(err.Error(), "decode base64") {
			t.Errorf("Expected 'decode base64' error, got %v", err)
		}
	})
	
	t.Run("path traversal attack", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		err := app.WriteBinaryFile("../../../tmp/evil.bin", "dGVzdA==")
		if err == nil {
			t.Error("Expected error for path traversal attempt")
		}
		if !strings.Contains(err.Error(), "outside vault") {
			t.Errorf("Expected 'outside vault' error, got %v", err)
		}
	})
	
	t.Run("overwrite existing binary file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		oldData := []byte("old data")
		os.WriteFile(filepath.Join(tempDir, "test.bin"), oldData, 0644)
		
		newData := []byte("new data")
		base64Data := base64.StdEncoding.EncodeToString(newData)
		
		err := app.WriteBinaryFile("test.bin", base64Data)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		filePath := filepath.Join(tempDir, "test.bin")
		readData, _ := os.ReadFile(filePath)
		if string(readData) != string(newData) {
			t.Errorf("Expected %s, got %s", string(newData), string(readData))
		}
	})
	
	t.Run("write empty binary file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		emptyData := []byte{}
		base64Data := base64.StdEncoding.EncodeToString(emptyData)
		
		err := app.WriteBinaryFile("empty.bin", base64Data)
		if err != nil {
			t.Errorf("Expected no error, got %v", err)
		}
		
		filePath := filepath.Join(tempDir, "empty.bin")
		info, _ := os.Stat(filePath)
		if info.Size() != 0 {
			t.Errorf("Expected empty file, got size %d", info.Size())
		}
	})
}

func TestBinaryFileRoundTrip(t *testing.T) {
	t.Run("write then read binary file", func(t *testing.T) {
		app := &internal.App{}
		tempDir := t.TempDir()
		app.OpenVault(tempDir)
		
		originalData := []byte{0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0xFF, 0x00, 0xAB, 0xCD}
		base64Data := base64.StdEncoding.EncodeToString(originalData)
		
		err := app.WriteBinaryFile("roundtrip.bin", base64Data)
		if err != nil {
			t.Errorf("Write failed: %v", err)
		}
		
		readBase64, err := app.ReadBinaryFile("roundtrip.bin")
		if err != nil {
			t.Errorf("Read failed: %v", err)
		}
		
		readData, _ := base64.StdEncoding.DecodeString(readBase64)
		if string(readData) != string(originalData) {
			t.Errorf("Round trip failed: expected %v, got %v", originalData, readData)
		}
	})
}