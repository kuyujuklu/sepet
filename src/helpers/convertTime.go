package helpers

import "time"

const (
	StandardApiTimeFormat = "2006-01-02 15:04:05"
	ShortApiTimeFormat    = "2006-01-02"
)

func ConvertToStandardApiTime(t time.Time) string {
	return t.UTC().Format("2006-01-02 15:04:05")
}

func ConvertToShortApiTime(t time.Time) string {
	return t.UTC().Format("2006-01-02")
}
