package internal

import (
	"os"
	"os/exec"
)

func (a *App) OpenNewInstance() error {
	executable, err := os.Executable()
	if err != nil {
		return err
	}

	cmd := exec.Command(executable)
	cmd.Env = os.Environ()

	return cmd.Start()
}
