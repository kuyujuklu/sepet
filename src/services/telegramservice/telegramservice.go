package telegramservice

import (
	"fmt"
	"os"
	"strconv"

	"github.com/alexkalak/qrmenu/src/errors/servererrors"
	"github.com/alexkalak/qrmenu/src/models"
	"github.com/alexkalak/qrmenu/src/repo/courierrepo"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
	"github.com/alexkalak/qrmenu/src/repo/telegramrepo"
	"github.com/mymmrac/telego"
)

type TelegramService interface {
	SendCreateOrderMessageForPub(pubID int, order models.Order) error
	SendCreateOrderMessageForCourier(chatID string, chatUsername string, order models.Order) error
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
	if update.Message.Text != "/start" {
		return
	}

	username := update.Message.From.Username
	if username == "" {
		return
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

		return
	}

	couriers, err := s.CourierRepo.GetAllCouriersWithTelegramUsername(username)
	if err != nil {
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   "Something went wrong while getting pubs",
		})
		return
	}

	if len(couriers) != 0 {
		s.bot.SendMessage(&telego.SendMessageParams{
			ChatID: update.Message.Chat.ChatID(),
			Text:   fmt.Sprintf("courier with name: %s and phone: %s has your telegram id", couriers[0].FullName, couriers[0].PhoneNumber),
		})

		chat := models.TelegramCourierChat{
			CourierID: int(couriers[0].ID),
			ChatID:    update.Message.Chat.ChatID().String(),
			Username:  update.Message.From.Username,
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

	fmt.Println("no one pub has your username in orders settings")
	s.bot.SendMessage(&telego.SendMessageParams{
		ChatID: update.Message.Chat.ChatID(),
		Text:   "no one pub has your username in orders settings",
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

	var totalPrice float64 = 0
	for _, dish := range orderDishes {
		totalPrice += float64(dish.Count) * dish.DishPrice
	}

	hasSuperUser := true
	suChat, err := s.TelegramRepo.GetChatByUsername(s.suTelegram)
	if err != nil {
		hasSuperUser = false
		fmt.Println("No super user chat")
	}

	orderTextForSuperUser := fmt.Sprintf(`
	New order number: %d 
	
	➡Full name: %s 
	➡Address: %s 
	📱Phone: %s 
	
	💸Total products price:  %.2f Lei

	URL: %s 
	`,
		order.ID,
		order.Client.Name,
		order.FullAddress,
		order.MainPhoneNumber,
		totalPrice,
		fmt.Sprintf("https://qrmenu.sandex.md/admin/pub/%d/order/%d", pubID, order.ID))

	if order.OrderType == models.IN_PLACE_ORDER_TYPE {
		orderTextForSuperUser = fmt.Sprintf("Pub name: %s \n New order number: %d \n In place order \n Table number: %d \n Total products price: %.2f Lei", pub.Name, order.ID, order.TableForInPlaceOrder, totalPrice)
	}

	suChatID, err := strconv.Atoi(suChat.ChatID)
	if err != nil {
		hasSuperUser = false
	}

	if hasSuperUser {
		s.bot.SendMessage(
			&telego.SendMessageParams{
				ChatID: telego.ChatID{
					ID:       int64(suChatID),
					Username: suChat.Username,
				},
				Text: orderTextForSuperUser,
			},
		)
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
		order.FullAddress,
		order.MainPhoneNumber,
		totalPrice,
		fmt.Sprintf("https://qrmenu.sandex.md/admin/pub/%d/order/%d", pubID, order.ID))

	if order.OrderType == models.IN_PLACE_ORDER_TYPE {
		orderText = fmt.Sprintf("New order number: %d \n In place order \n Table number: %d \n Total products price: %.2f Lei", order.ID, order.TableForInPlaceOrder, totalPrice)
	}

	s.bot.SendMessage(
		&telego.SendMessageParams{
			ChatID: telego.ChatID{
				ID:       int64(chatID),
				Username: chat.Username,
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

	var totalPrice float64 = 0
	for _, dish := range orderDishes {
		totalPrice += float64(dish.Count) * dish.DishPrice
	}

	orderText := fmt.Sprintf(
		`New order number: %d
	
		➡Pub name: %s
		➡Pub address: %s
		➡Client address %s
		💸Delivery Price : %.2f Lei

		ℹ️Comment: %s

		https://qrmenu.sandex.md/courier/orders`,
		order.ID,
		order.Pub.Name,
		order.Pub.Address,
		order.Town+", "+order.FullAddress,
		order.DeliveryPrice,
		order.Comments)

	chatIDint, err := strconv.Atoi(chatID)
	if err != nil {
		return err
	}

	s.bot.SendMessage(
		&telego.SendMessageParams{
			ChatID: telego.ChatID{
				ID:       int64(chatIDint),
				Username: chatUsername,
			},
			Text: orderText,
		},
	)

	return nil
}
