package enverrors

import "errors"

func GenerateEnvError(errStr string) error {
	return errors.New("invalid value for " + errStr + " environment variable")
}
