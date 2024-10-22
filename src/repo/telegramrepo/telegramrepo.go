package telegramrepo

import (
	"errors"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/telegramerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

type TelegramRepo interface {
	GetAllCourierChats() ([]models.TelegramCourierChat, error)
	GetChatByUsername(username string) (models.TelegramChat, error)
	GetChatByChatID(chatID string) (models.TelegramChat, error)
	GetAllTelegramChatsForPub(pubID int) ([]models.TelegramChat, error)
	CreateChat(chat models.TelegramChat) (models.TelegramChat, error)
	CreateCourierChat(chat models.TelegramCourierChat) (models.TelegramCourierChat, error)
	DeleteAllChatsForPub(pubID int) error
}

type telegramRepo struct {
	Database *gorm.DB
}

func New() TelegramRepo {
	return &telegramRepo{
		Database: postgresql.GetDB(),
	}
}

func (r *telegramRepo) GetAllCourierChats() ([]models.TelegramCourierChat, error) {
	var couriers []models.TelegramCourierChat
	result := r.Database.Find(&couriers)

	if result.Error != nil {
		return nil, telegramerrors.ErrUnableToCreateChat
	}

	return couriers, nil
}

func (r *telegramRepo) GetChatByChatID(chatID string) (models.TelegramChat, error) {
	var telegramChat models.TelegramChat
	result := r.Database.First(&telegramChat, "chat_id = ?", chatID)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.TelegramChat{}, telegramerrors.ErrChatNotFound
		}
		return models.TelegramChat{}, telegramerrors.ErrUnableToGetChat
	}

	return telegramChat, nil
}

func (r *telegramRepo) GetChatByUsername(username string) (models.TelegramChat, error) {
	var telegramChat models.TelegramChat
	result := r.Database.First(&telegramChat, "username = ?", username)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.TelegramChat{}, telegramerrors.ErrChatNotFound
		}
		return models.TelegramChat{}, telegramerrors.ErrUnableToGetChat
	}

	return telegramChat, nil

}

func (r *telegramRepo) GetAllTelegramChatsForPub(pubID int) ([]models.TelegramChat, error) {
	var telegramChats []models.TelegramChat
	result := r.Database.Find(&telegramChats, "pub_id = ?", pubID)

	if result.Error != nil {
		return nil, telegramerrors.ErrUnableToGetChat
	}

	return telegramChats, nil
}

func (r *telegramRepo) CreateChat(chat models.TelegramChat) (models.TelegramChat, error) {
	_, err := r.GetChatByChatID(chat.ChatID)
	if err == nil {
		return models.TelegramChat{}, telegramerrors.ErrChatWithTheSameChatIDAlreadyExists
	}
	if err != telegramerrors.ErrChatNotFound {
		return models.TelegramChat{}, err
	}

	resp := r.Database.Create(&chat)
	if resp.Error != nil {
		return models.TelegramChat{}, telegramerrors.ErrUnableToCreateChat
	}

	return chat, nil
}

func (r *telegramRepo) CreateCourierChat(chat models.TelegramCourierChat) (models.TelegramCourierChat, error) {
	_, err := r.GetChatByChatID(chat.ChatID)
	if err == nil {
		return models.TelegramCourierChat{}, telegramerrors.ErrChatWithTheSameChatIDAlreadyExists
	}
	if err != telegramerrors.ErrChatNotFound {
		return models.TelegramCourierChat{}, err
	}

	resp := r.Database.Create(&chat)
	if resp.Error != nil {
		return models.TelegramCourierChat{}, telegramerrors.ErrUnableToCreateChat
	}

	return chat, nil
}

func (r *telegramRepo) DeleteAllChatsForPub(pubID int) error {
	resp := r.Database.Delete(&models.TelegramChat{}).Where("pub_id = ?", pubID)
	if resp.Error != nil {
		return telegramerrors.ErrUnableToDeleteChat
	}
	return nil
}
