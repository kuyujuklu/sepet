package entities

// Percent is applied as price * (1 + percent/100) - e.g. 10 for +10%, -15
// for -15%. Deliberately unvalidated beyond being numeric: 0 is a legitimate
// (if useless) no-op request.
type BulkPriceInput struct {
	Percent float64 `json:"percent" example:"10"`
}
