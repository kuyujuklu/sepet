package companyerrors

import "errors"

var ErrUnableToGetCompany = errors.New("unable to get company")

var ErrCompanyNotFound = errors.New("company not found")

var ErrCompanyWithTheSameEmailAlreadyExists = errors.New("company with the same email already exists")

var ErrCompanyWithTheSameNameAlreadyExists = errors.New("company with the same name already exists")

var ErrUnableToCreateCompany = errors.New("unable to create company")

var ErrUnableToUpdateCompany = errors.New("unable to update company")

var ErrUnableToDeleteCompany = errors.New("unable to delete company")
