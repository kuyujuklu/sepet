package helpers

import "time"

const (
	StandardApiTimeFormat = "2006-01-02 15:04:05"
	ShortApiTimeFormat    = "2006-01-02"
)

func ConvertFromStandardApiTime(timeString string) time.Time {
	parsedTime, err := time.Parse(StandardApiTimeFormat, timeString)
	if err != nil {
		return time.Time{}
	}

	return parsedTime
}

func ConvertFromShortApiTime(timeString string) time.Time {
	parsedTime, err := time.Parse(ShortApiTimeFormat, timeString)
	if err != nil {
		return time.Time{}
	}

	return parsedTime
}

func ConvertToStandardApiTime(t time.Time) string {
	return t.UTC().Format("2006-01-02 15:04:05")
}

func ConvertToShortApiTime(t time.Time) string {
	return t.UTC().Format("2006-01-02")
}
