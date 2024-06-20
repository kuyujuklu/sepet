package telegramservice

import (
	"fmt"
	"os"
	"strconv"

	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/repo/telegramrepo"
	"github.com/mymmrac/telego"
)

type TelegramService interface {
	SendCreateOrderMessageForPub(pubID int, order models.Order) error
}
type telegramSerivce struct {
	TelegramRepo telegramrepo.TelegramRepo
	PubsRepo     pubsrepo.PubsRepo
	botToken     string
	bot          *telego.Bot
}

var singleton *telegramSerivce

func New() (TelegramService, error) {
	if singleton == nil {
		fmt.Println("TOKEN : ", os.Getenv("TELEGRAM_QRMENU_BOT_TOKEN"))
		singleton = &telegramSerivce{
			PubsRepo:     pubsrepo.New(),
			TelegramRepo: telegramrepo.New(),
			botToken:     os.Getenv("TELEGRAM_QRMENU_BOT_TOKEN"),
		}

		err := singleton.setup()
		if err != nil {
			singleton = nil
			return nil, err
		}

		go singleton.listenUpdates()
	}

	return singleton, nil
}

func (s *telegramSerivce) setup() error {
	var err error
	s.bot, err = telego.NewBot(s.botToken, telego.WithDefaultDebugLogger())
	if err != nil {
		fmt.Println("telegram bot initializing error ", err)
		return err
	}

	return nil
}

func (s *telegramSerivce) listenUpdates() {
	// Get updates channel
	updates, _ := s.bot.UpdatesViaLongPolling(nil)

	// Stop reviving updates from update channel
	defer s.bot.StopLongPolling()

	// Loop through all updates when they came
	for update := range updates {
		s.handleUpdate(update)
	}
}

func (s *telegramSerivce) handleUpdate(update telego.Update) {
	if update.Message == nil {
		return
	}
	if update.Message.Text != "/start" {
		return
	}

	username := update.Message.From.Username
	if username == "" {
		return
	}

	pubs, err := s.PubsRepo.GetPubsWhichHasTelegramUsername(username)
	if err != nil {
		fmt.Println("telegram getting pubs error: ", err)
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   "Something went wrong try again",
		})
		return
	}

	if len(pubs) == 0 {
		fmt.Println("no one pub has your username in orders settings")
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   "no one pub has your username in orders settings",
		})
		return
	}

	s.bot.SendMessage(&telego.SendMessageParams{
		ChatID: update.Message.Chat.ChatID(),
		Text:   fmt.Sprintf("pub with name: %s and url_name: %s has your id, good luck", pubs[0].Name, pubs[0].UrlName),
	})

	chat := models.TelegramChat{
		PubID:    int(pubs[0].ID),
		ChatID:   update.Message.Chat.ChatID().String(),
		Username: update.Message.From.Username,
	}

	chat, err = s.TelegramRepo.CreateChat(chat)
	if err != nil {
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   "Something went wrong try again",
		})
		return
	}

	s.bot.SendMessage(&telego.SendMessageParams{
		ChatID: update.Message.Chat.ChatID(),
		Text:   fmt.Sprintf("Chat was created %s", chat.ChatID),
	})
}

func (s *telegramSerivce) SendCreateOrderMessageForPub(pubID int, order models.Order) error {
	pub, err := s.PubsRepo.GetPubById(pubID)
	if err != nil {
		return err
	}

	chat, err := s.TelegramRepo.GetChatByUsername(pub.TelegramUsername)
	if err != nil {
		return err
	}

	chatID, err := strconv.Atoi(chat.ChatID)
	if err != nil {
		return err
	}

	s.bot.SendMessage(
		&telego.SendMessageParams{
			ChatID: telego.ChatID{
				ID:       int64(chatID),
				Username: chat.Username,
			},
			Text: fmt.Sprintf("New order id: %d, full_name: %s, address: %s, main_phone_number: %s", order.ID, order.Client.Name, order.FullAddress, order.MainPhoneNumber),
		},
	)

	return nil
}
