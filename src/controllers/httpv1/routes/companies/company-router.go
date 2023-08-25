package companies

import (
	"github.com/alexkalak/qrmenu/src/controllers/httpv1/middleware"
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/jwtservice"
	"github.com/alexkalak/qrmenu/src/services/roleservice"
	"github.com/gofiber/fiber/v2"
)

type companiesController struct {
	CompanyService companyservice.CompanyService
	RoleService    roleservice.RoleService
	jwtservice.JwtService
}

func New() *companiesController {
	return &companiesController{
		CompanyService: companyservice.New(),
		RoleService:    roleservice.New(),
		JwtService:     jwtservice.New(),
	}
}

func (c *companiesController) UnauthorizedRouter(router fiber.Router) {
	router.Post("/", c.CreateCompany)
}

func (c *companiesController) AuthorizedRouter(router fiber.Router) {
	router.Use(middleware.StrictAuthMW)
	router.Get("/", c.GetCompanyByAccessToken)
	router.Get("/:companyID<int>", c.GetCompanyByAccessToken)
}
