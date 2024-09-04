package osrmentities

type OsrmRespose struct {
	Code      string      `json:"code"`
	Distances [][]float64 `json:"distances"`
}
