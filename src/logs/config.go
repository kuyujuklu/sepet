package logs

import (
	"io"
	"log"
)

type Loggers struct {
	Warnings *log.Logger
	Errors   *log.Logger
	Info     *log.Logger
}

type LogsConfig struct {
	Warnings io.Writer
	Errors   io.Writer
	Info     io.Writer
}

var LoggersInstance Loggers

func Info(params ...interface{}) {
	if LoggersInstance.Info == nil {
		panic("Logger not configured")
	}
	LoggersInstance.Info.Println(params...)
}

func Warning(params ...interface{}) {
	if LoggersInstance.Warnings == nil {
		panic("Logger not configured")
	}
	LoggersInstance.Warnings.Println(params...)
}

func Error(params ...interface{}) {
	if LoggersInstance.Errors == nil {
		panic("Logger not configured")
	}
	LoggersInstance.Errors.Println(params...)
}

func Configure(config LogsConfig) {
	LoggersInstance = Loggers{}
	LoggersInstance.Info = log.New(config.Info, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	LoggersInstance.Errors = log.New(config.Errors, "ERROR: ", log.Ldate|log.Ltime|log.Lshortfile)
	LoggersInstance.Warnings = log.New(config.Warnings, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
}
