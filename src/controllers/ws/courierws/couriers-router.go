package courierws

import (
	"fmt"

	"github.com/alexkalak/qrmenu/src/controllers/ws/wsutils"
	"github.com/alexkalak/qrmenu/src/services/courierservice"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/savsgio/gotils/strconv"
)

type couriersController struct {
	CourierService courierservice.CourierService
	JwtService     jwtservice.JwtService
}

func New() *couriersController {
	return &couriersController{
		CourierService: courierservice.New(),
		JwtService:     jwtservice.New(),
	}
}

func (c *couriersController) AuthorizedRouter(router fiber.Router) {
	router.Use("/", func(ctx *fiber.Ctx) error {
		fmt.Println("hi")
		err := wsutils.AuthorizeByCookie(ctx)
		if err != nil {
			fmt.Println("WS authorization error: ", err)
			return err
		}

		fmt.Println("connection peek", strconv.B2S(ctx.Context().Request.Header.Peek("Connection")))
		fmt.Println("upgrade peek", strconv.B2S(ctx.Context().Request.Header.Peek("Upgrade")))

		// IsWebSocketUpgrade returns true if the client
		// requested upgrade to the WebSocket protocol.
		if websocket.IsWebSocketUpgrade(ctx) {
			fmt.Println("allowed connection: ", ctx.IP())
			ctx.Locals("allowed", true)

			return ctx.Next()
		}
		fmt.Println("upgrade connection err: ", ctx.IP())
		return fiber.ErrUpgradeRequired
	})

	router.Get("/:courierID<int>", websocket.New(c.ConnectToOrdersForCourier))
}
