package entitiesdeps

import (
	"github.com/alexkalak/qrmenu/src/services/companyservice"
	"github.com/alexkalak/qrmenu/src/services/tariffservice"
)

var Deps = struct {
	CompanyService companyservice.CompanyService
	TariffService  tariffservice.TariffService
}{
	CompanyService: companyservice.New(),
	TariffService:  tariffservice.New(),
}
