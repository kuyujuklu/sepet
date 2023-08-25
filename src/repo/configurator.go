package repo

import (
	"github.com/alexkalak/qrmenu/src/repo/categoryrepo"
	"github.com/alexkalak/qrmenu/src/repo/companyrepo"
	"github.com/alexkalak/qrmenu/src/repo/dishesrepo"
	"github.com/alexkalak/qrmenu/src/repo/menurepo"
	"github.com/alexkalak/qrmenu/src/repo/pubsrepo"
)

func Configure() error {
	if err := companyrepo.Configure(); err != nil {
		return err
	}

	if err := pubsrepo.Configure(); err != nil {
		return err
	}

	if err := menurepo.Configure(); err != nil {
		return err
	}

	if err := categoryrepo.Configure(); err != nil {
		return err
	}

	if err := dishesrepo.Configure(); err != nil {
		return err
	}

	return nil
}
