package orders

import (
	"fmt"

	"github.com/alexkalak/qrmenu/src/controllers/httpv1/locals"
	"github.com/alexkalak/qrmenu/src/errors/jwterrors"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/alexkalak/qrmenu/src/services/orderservice"
	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/savsgio/gotils/strconv"
)

type ordersController struct {
	OrdersService orderservice.OrderService
	JwtService    jwtservice.JwtService
}

func New() *ordersController {
	return &ordersController{
		OrdersService: orderservice.New(),
		JwtService:    jwtservice.New(),
	}
}

func (c *ordersController) AuthorizeByCookie(ctx *fiber.Ctx) error {
	accessToken := ctx.Query("access_token")
	fmt.Println("in websocket authorization")

	if accessToken == "" {
		return jwterrors.ErrEmptyAccessToken
	}

	userClaims, ok, err := c.JwtService.ParseJwtTokenString(accessToken)
	if err != nil {
		switch err {
		case jwterrors.ErrTokenExpired:
			return jwterrors.ErrTokenExpired
		case jwterrors.ErrNotValidSignature:
			return jwterrors.ErrNotValidSignature
		default:
			return jwterrors.ErrNotValidToken
		}
	}

	if !ok {
		return jwterrors.ErrNotValidToken
	}

	fmt.Println("setting locals usr id: ", userClaims.ID)
	fmt.Println("setting locals usr sig: ", userClaims.Significance)

	ctx.Locals(locals.USER_ID_LOCALS, userClaims.ID)
	ctx.Locals(locals.USER_SIGNIFICANCE_LOCALS, userClaims.Significance)
	return nil
}

func (c *ordersController) AuthorizedRouter(router fiber.Router) {
	router.Use("/", func(ctx *fiber.Ctx) error {
		err := c.AuthorizeByCookie(ctx)
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

	router.Get("/company/:companyID/pub/:pubID", websocket.New(c.ConnectToOrdersForPub))
}
