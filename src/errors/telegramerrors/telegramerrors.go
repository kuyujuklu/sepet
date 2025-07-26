package telegramerrors

import "errors"

var (
	ErrChatNotFound                       = errors.New("telegram chat not found")
	ErrChatWithTheSameChatIDAlreadyExists = errors.New("telegram chat with the same chat_id already exists")
	ErrUnableToCreateChat                 = errors.New("telegram unable to get chat")
	ErrUnableToDeleteChat                 = errors.New("telegram unable to delete chat")
	ErrUnableToGetChat                    = errors.New("telegram unable to get chat")
	ErrUnableToCreateSuperUser            = errors.New("telegram unable to create super user")
	ErrSuperUserAlreadyExists             = errors.New("telegram super user already exists")
)
