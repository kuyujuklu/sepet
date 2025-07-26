package telegramservice

import (
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/errors/telegramerrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/courierrepo"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/repo/telegramrepo"
	"github.com/mymmrac/telego"
)

type TelegramService interface {
	SendCreateOrderMessageForPub(pubID int, order models.Order) error
	SendCreateOrderMessageForCourier(chatID string, chatUsername string, order models.Order) error
	CreateTelegramSuperUser(username string) (models.TelegramSuperUser, error)
	SetPubsForSuperUser(username string, pubsJSON string) error
}
type telegramSerivce struct {
	CourierRepo  courierrepo.CourierRepo
	TelegramRepo telegramrepo.TelegramRepo
	PubsRepo     pubsrepo.PubsRepo
	botToken     string
	bot          *telego.Bot
	suTelegram   string
}

var singleton *telegramSerivce

func New() (TelegramService, error) {
	if singleton == nil {

		fmt.Println("TOKEN : ", os.Getenv("TELEGRAM_QRMENU_BOT_TOKEN"))
		singleton = &telegramSerivce{
			CourierRepo:  courierrepo.New(),
			PubsRepo:     pubsrepo.New(),
			TelegramRepo: telegramrepo.New(),
			botToken:     os.Getenv("TELEGRAM_QRMENU_BOT_TOKEN"),
			suTelegram:   os.Getenv("SUPER_USER_TELEGRAM"),
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
	s.bot, err = telego.NewBot(s.botToken, telego.WithDiscardLogger())
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
	if update.Message.Text == "/start" {
		s.handleStart(&update)
	}
	//if update.Message.Text == "/show_pubs" {
	//	s.showPubs(&update)
	//}
}

func (s *telegramSerivce) handleStart(update *telego.Update) {
	username := strings.ToLower(update.Message.From.Username)
	if username == "" {
		return
	}

	superUsers, err := s.TelegramRepo.GetAllSuperUsersWithTelegramUsername(username)
	if err != nil {
		return
	}

	if len(superUsers) != 0 {
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   fmt.Sprintf("Super user with name: %s was found", superUsers[0].Username),
		})

		chat := models.TelegramChat{
			PubID:    int(superUsers[0].ID),
			ChatID:   update.Message.Chat.ChatID().String(),
			Username: strings.ToLower(update.Message.From.Username),
		}
		suChat := models.TelegramSuperUserChat{
			ChatID:      update.Message.Chat.ChatID().String(),
			SuperUserID: int(superUsers[0].ID),
			Username:    username,
			PubIDsJSON:  "[]",
		}

		chat, err = s.TelegramRepo.CreateChat(chat)
		hasError := false
		errText := ""
		if err != nil && err != telegramerrors.ErrChatWithTheSameChatIDAlreadyExists {
			hasError = true
			errText = err.Error()
		}
		suChat, err = s.TelegramRepo.CreateTelegramSuperUserChat(suChat)
		if err != nil && err != telegramerrors.ErrSuperUserAlreadyExists {
			fmt.Println("telegram su chat created error", suChat)
			hasError = true
			errText = err.Error()
		}

		if hasError {
			s.bot.SendMessage(&telego.SendMessageParams{
				ChatID: update.Message.Chat.ChatID(),
				Text:   fmt.Sprintf("Something went wrong try again: %s", errText),
			})
		} else {
			s.bot.SendMessage(&telego.SendMessageParams{
				ChatID: update.Message.Chat.ChatID(),
				Text:   fmt.Sprintf("Chat was created %s", chat.ChatID),
			})
		}
	}

	pubs, err := s.PubsRepo.GetPubsWhichHasTelegramUsername(username)
	if err != nil {
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   "Something went wrong while getting pubs",
		})
		return
	}

	if len(pubs) != 0 {
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   fmt.Sprintf("pub with name: %s and url_name: %s has your id, good luck", pubs[0].Name, pubs[0].UrlName),
		})

		chat := models.TelegramChat{
			PubID:    int(pubs[0].ID),
			ChatID:   update.Message.Chat.ChatID().String(),
			Username: strings.ToLower(update.Message.From.Username),
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

		return
	}

	couriers, err := s.CourierRepo.GetAllCouriersWithTelegramUsername(strings.ToLower(username))
	if err != nil {
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   "Something went wrong while getting pubs",
		})
		return
	}

	if len(couriers) != 0 {
		_, err := s.TelegramRepo.GetCourierChatByUsername(strings.ToLower(update.Message.From.Username))
		if err == nil {
			s.bot.SendMessage(&telego.SendMessageParams{
				ChatID: update.Message.Chat.ChatID(),
				Text:   fmt.Sprintf("courier with name: %s and phone: %s has your telegram id", couriers[0].FullName, couriers[0].PhoneNumber),
			})
			return
		}

		chat := models.TelegramCourierChat{
			CourierID: int(couriers[0].ID),
			ChatID:    update.Message.Chat.ChatID().String(),
			Username:  strings.ToLower(update.Message.From.Username),
		}

		chat, err = s.TelegramRepo.CreateCourierChat(chat)
		if err != nil {
			fmt.Println("ERRR: ", err)
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

		return
	}

	fmt.Println("no one pub or courier has your username in orders settings")
	s.bot.SendMessage(&telego.SendMessageParams{
		ChatID: update.Message.Chat.ChatID(),
		Text:   "no one pub or courier has your username in orders settings",
	})
}

func (s *telegramSerivce) SendCreateOrderMessageForPub(pubID int, order models.Order) error {
	pub, err := s.PubsRepo.GetPubById(pubID)
	if err != nil {
		return err
	}

	orderDishes, err := order.GetDishes()
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	var totalDishPrice float64 = 0
	for _, dish := range orderDishes {
		totalDishPrice += float64(dish.Count) * dish.DishPrice
	}

	allSuChats, err := s.TelegramRepo.GetAllSuperUserChats()
	fmt.Println("all su chats", allSuChats)
	if err != nil {
		fmt.Printf("getting su chats error: %s", err)
		allSuChats = make([]models.TelegramSuperUserChat, 0)
	}

	suChats := make([]models.TelegramSuperUserChat, 0)
	if len(allSuChats) > 0 {
		for _, suChat := range allSuChats {
			pubIDs, err := suChat.GetPubIDs()
			if err != nil {
				continue
			}
			fmt.Println("Pub ids for ", suChat.Username, ": ", pubIDs)

			for _, id := range pubIDs {
				if id == int64(pubID) {
					suChats = append(suChats, suChat)
				}
			}
		}
	}

	orderTextForSuperUser := fmt.Sprintf(`
	New order number: %d 
	
	Pub Name: %s 
	Pub Address: %s 
	➡Full name: %s 
	➡Address: %s 
	📱Phone: %s 
	
	💸Total products price without commission:  %.2f Lei,
	💸Commission: %.2f,
	💸CourierReward: %.2f,


	URL: %s 
	`,
		order.ID,
		order.Pub.Name,
		order.Pub.Address,
		order.Client.Name,
		order.Town+" "+order.FullAddress,
		order.MainPhoneNumber,
		order.TotalDishesPriceWithoutCommission,
		order.OrderCourierInfo.CourierDebit,
		order.OrderCourierInfo.CourierReward,
		fmt.Sprintf("https://sepet.md/admin/pub/%d/order/%d", pubID, order.ID))

	if order.OrderType == models.IN_PLACE_ORDER_TYPE {
		orderTextForSuperUser = fmt.Sprintf("Pub name: %s \n New order number: %d \n In place order \n Table number: %d \n Total products price: %.2f Lei", pub.Name, order.ID, order.TableForInPlaceOrder, totalDishPrice)
	}

	if len(suChats) > 0 {
		for _, suChat := range suChats {
			chatID, _ := strconv.Atoi(suChat.ChatID)
			fmt.Println("Sending to su chat: ", chatID, suChat.Username)
			_, err = s.bot.SendMessage(
				&telego.SendMessageParams{
					ChatID: telego.ChatID{
						ID:       int64(chatID),
						Username: strings.ToLower(suChat.Username),
					},
					Text: orderTextForSuperUser,
				},
			)
			if err != nil {
				fmt.Println("Sending to su chat error: ", err)
			}
		}
	}

	chat, err := s.TelegramRepo.GetChatByUsername(pub.TelegramUsername)
	if err != nil {
		return err
	}

	chatID, err := strconv.Atoi(chat.ChatID)
	if err != nil {
		return err
	}

	orderText := fmt.Sprintf(`
	New order number: %d 
	
	➡Full name: %s 
	➡Address: %s 
	📱Phone: %s 
	
	💸Total products price:  %.2f Lei

	URL: %s 
	`,
		order.ID,
		order.Client.Name,
		order.Town+" "+order.FullAddress,
		order.MainPhoneNumber,
		totalDishPrice,
		fmt.Sprintf("https://sepet.md/admin/pub/%d/order/%d", pubID, order.ID))

	if order.OrderType == models.IN_PLACE_ORDER_TYPE {
		orderText = fmt.Sprintf("New order number: %d \n In place order \n Table number: %d \n Total products price: %.2f Lei", order.ID, order.TableForInPlaceOrder, totalDishPrice)
	}

	s.bot.SendMessage(
		&telego.SendMessageParams{
			ChatID: telego.ChatID{
				ID:       int64(chatID),
				Username: strings.ToLower(chat.Username),
			},
			Text: orderText,
		},
	)

	return nil
}

func (s *telegramSerivce) SendCreateOrderMessageForCourier(chatID string, chatUsername string, order models.Order) error {
	orderDishes, err := order.GetDishes()
	if err != nil {
		return servererrors.ErrInternalServerError
	}

	var totalDishPrice float64 = 0
	for _, dish := range orderDishes {
		totalDishPrice += float64(dish.Count) * dish.DishPrice
	}

	orderText := fmt.Sprintf(
		`New order number: %d
	
		➡Pub name: %s
		➡Pub address: %s
		➡Client address: %s

		ℹ️Comment: %s

		https://sepet.md/courier/orders`,
		order.ID,
		order.Pub.Name,
		order.Pub.Address,
		order.Town+", "+order.FullAddress,
		order.Comments)

	chatIDint, err := strconv.Atoi(chatID)
	if err != nil {
		return err
	}

	s.bot.SendMessage(
		&telego.SendMessageParams{
			ChatID: telego.ChatID{
				ID:       int64(chatIDint),
				Username: strings.ToLower(chatUsername),
			},
			Text: orderText,
		},
	)

	return nil
}

func (s *telegramSerivce) CreateTelegramSuperUser(username string) (models.TelegramSuperUser, error) {
	superUser := models.TelegramSuperUser{
		Username: username,
	}
	return s.TelegramRepo.CreateTelegramSuperUser(superUser)
}

func (s *telegramSerivce) SetPubsForSuperUser(username string, pubsJSON string) error {
	return s.TelegramRepo.SetPubsForSuperUser(username, pubsJSON)
}
