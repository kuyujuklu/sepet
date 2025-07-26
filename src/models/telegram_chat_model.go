package models

import (
	"encoding/json"

	"gorm.io/gorm"
)

type TelegramChat struct {
	gorm.Model
	PubID    int
	ChatID   string
	Username string
}

type TelegramCourierChat struct {
	gorm.Model
	CourierID int
	ChatID    string
	Username  string
}

type TelegramSuperUserChat struct {
	gorm.Model
	SuperUserID int
	ChatID      string
	Username    string
	PubIDsJSON  string
}

func (t *TelegramSuperUserChat) GetPubIDs() ([]int64, error) {
	var IDs []int64
	if t.PubIDsJSON == "" {
		return nil, nil
	}

	err := json.Unmarshal([]byte(t.PubIDsJSON), &IDs)
	if err != nil {
		return nil, err
	}
	return IDs, nil
}

type TelegramSuperUser struct {
	gorm.Model
	Username string
}
