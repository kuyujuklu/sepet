package telegramrepo

import (
	"errors"
	"strings"

	"github.com/alexkalak/qrmenu/src/db/postgresql"
	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/errors/telegramerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"gorm.io/gorm"
)

type TelegramRepo interface {
	GetAllCourierChats() ([]models.TelegramCourierChat, error)
	GetCourierChatByUsername(username string) (models.TelegramCourierChat, error)
	GetChatByUsername(username string) (models.TelegramChat, error)
	GetChatByChatID(chatID string) (models.TelegramChat, error)
	GetAllTelegramChatsForPub(pubID int) ([]models.TelegramChat, error)
	CreateChat(chat models.TelegramChat) (models.TelegramChat, error)
	CreateCourierChat(chat models.TelegramCourierChat) (models.TelegramCourierChat, error)
	CreateTelegramSuperUserChat(chat models.TelegramSuperUserChat) (models.TelegramSuperUserChat, error)
	CreateTelegramSuperUser(su models.TelegramSuperUser) (models.TelegramSuperUser, error)
	DeleteAllChatsForPub(pubID int) error
	GetAllSuperUsersWithTelegramUsername(telegramUsername string) ([]models.TelegramSuperUser, error)
	GetAllSuperUserChats() ([]models.TelegramSuperUserChat, error)
	GetAllSuperUserChatsWithTelegramUsername(telegramUsername string) ([]models.TelegramSuperUserChat, error)
	SetPubsForSuperUser(username string, pubsJSON string) error
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

func (r *telegramRepo) GetCourierChatByUsername(username string) (models.TelegramCourierChat, error) {
	var telegramChat models.TelegramCourierChat
	result := r.Database.First(&telegramChat, "UPPER(username) = ?", strings.ToUpper(username))

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return models.TelegramCourierChat{}, telegramerrors.ErrChatNotFound
		}
		return models.TelegramCourierChat{}, telegramerrors.ErrUnableToGetChat
	}

	return telegramChat, nil
}

func (r *telegramRepo) GetChatByUsername(username string) (models.TelegramChat, error) {
	var telegramChat models.TelegramChat
	result := r.Database.First(&telegramChat, "UPPER(username) = ?", strings.ToUpper(username))

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

func (r *telegramRepo) CreateTelegramSuperUserChat(chat models.TelegramSuperUserChat) (models.TelegramSuperUserChat, error) {
	chats, err := r.GetAllSuperUserChatsWithTelegramUsername(chat.Username)
	if err != nil {
		return models.TelegramSuperUserChat{}, err
	}
	if len(chats) > 0 {
		return models.TelegramSuperUserChat{}, telegramerrors.ErrSuperUserAlreadyExists
	}

	resp := r.Database.Create(&chat)
	if resp.Error != nil {
		return models.TelegramSuperUserChat{}, telegramerrors.ErrUnableToCreateChat
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

func (r *telegramRepo) CreateTelegramSuperUser(su models.TelegramSuperUser) (models.TelegramSuperUser, error) {
	telegramSuperUsers, err := r.GetAllSuperUsersWithTelegramUsername(su.Username)
	if err != nil {
		return models.TelegramSuperUser{}, err
	}

	if len(telegramSuperUsers) > 0 {
		return models.TelegramSuperUser{}, telegramerrors.ErrSuperUserAlreadyExists
	}

	su.Username = strings.ToUpper(su.Username)
	resp := r.Database.Create(&su)
	if resp.Error != nil {
		return models.TelegramSuperUser{}, telegramerrors.ErrUnableToCreateSuperUser
	}

	return su, nil
}

func (r *telegramRepo) GetAllSuperUsersWithTelegramUsername(telegramUsername string) ([]models.TelegramSuperUser, error) {
	var superUsers []models.TelegramSuperUser
	result := r.Database.Find(&superUsers, "UPPER(username) = ?", strings.ToUpper(telegramUsername))

	if result.Error != nil {
		return nil, telegramerrors.ErrChatNotFound
	}

	return superUsers, nil
}

func (r *telegramRepo) GetAllSuperUserChatsWithTelegramUsername(telegramUsername string) ([]models.TelegramSuperUserChat, error) {
	var superUsers []models.TelegramSuperUserChat
	result := r.Database.Find(&superUsers, "UPPER(username) = ?", strings.ToUpper(telegramUsername))

	if result.Error != nil {
		return nil, telegramerrors.ErrChatNotFound
	}

	return superUsers, nil
}

func (r *telegramRepo) GetAllSuperUserChats() ([]models.TelegramSuperUserChat, error) {
	var superUsers []models.TelegramSuperUserChat
	result := r.Database.Find(&superUsers)

	if result.Error != nil {
		return nil, telegramerrors.ErrChatNotFound
	}

	return superUsers, nil
}

func (r *telegramRepo) SetPubsForSuperUser(username string, pubsJSON string) error {
	superUsers, err := r.GetAllSuperUserChatsWithTelegramUsername(username)
	if err != nil {
		return servererrors.ErrInternalServerError
	}
	if len(superUsers) == 0 {
		return telegramerrors.ErrChatNotFound
	}

	result := r.Database.
		Model(&models.TelegramSuperUserChat{}).
		Where("username = ?", username).
		UpdateColumn("pub_ids_json", pubsJSON)

	if result.Error != nil {
		return servererrors.ErrInternalServerError
	}

	return nil
}
