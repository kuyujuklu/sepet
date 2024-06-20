package helpers

import "encoding/json"

func ConvertToJSON(i interface{}) string {

	str, err := json.MarshalIndent(i, "", "\t")
	if err != nil {
		return "cannot convert to json"
	}
	return string(str)
}
