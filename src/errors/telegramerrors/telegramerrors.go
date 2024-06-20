package telegramerrors

import "errors"

var ErrChatNotFound = errors.New("telegram chat not found")
var ErrChatWithTheSameChatIDAlreadyExists = errors.New("telegram chat with the same chat_id already exists")
var ErrUnableToCreateChat = errors.New("telegram unable to get chat")
var ErrUnableToDeleteChat = errors.New("telegram unable to delete chat")
var ErrUnableToGetChat = errors.New("telegram unable to get chat")
