package entities

type SendToAllClientNotificationRequest struct {
	TitleRo string `json:"title_ro"`
	TitleRu string `json:"title_ru"`
	BodyRo  string `json:"body_ro"`
	BodyRu  string `json:"body_ru"`
}

type SendNotificationToToken struct {
	Token   string `json:"token"`
	Lang    string `json:"lang"`
	TitleRo string `json:"title_ro"`
	TitleRu string `json:"title_ru"`
	BodyRo  string `json:"body_ro"`
	BodyRu  string `json:"body_ru"`
}
