package companies

// @Summary      Update company
// @Description  Updates company
// @Tags         company
// @Param id path int true "company id"
// @Param input body entities.CompanyInput true "company params"
// @Accept       json
// @Produce      json
// @Success      200  {object}  entities.CompanyOutput
// @Router       /company/{id} [PUT]
// @Security ApiKeyAuth
// @Param AccessToken header string  true "accesstoken"
// func (c *companiesController) UpdateCompany(ctx *fiber.Ctx) error {
// 	id, err := strconv.Atoi(ctx.Params("companyID"))
// 	if err != nil {
// 		return h.SendError(ctx, httperrors.ErrBadID, h.AUTOMATIC_STATUS_CODE)
// 	}

// 	input, validationErrors, err := input.ParseRequestBody[entities.CompanyInput](ctx)
// 	if err != nil {
// 		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
// 	}
// 	if len(validationErrors) > 0 {
// 		return h.SendValidationErrors(ctx, validationErrors)
// 	}

// 	company, err := input.ConvertToModel()
// 	if err != nil {
// 		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
// 	}

// 	modelsCompany, err := c.CompanyService.UpdateCompany(id, company)
// 	if err != nil {
// 		return h.SendError(ctx, err, h.AUTOMATIC_STATUS_CODE)
// 	}

// 	output := entities.CompanyOutput{}
// 	output.ConvertFromModel(modelsCompany)

// 	return h.SendSuccess(
// 		ctx,
// 		fiber.Map{
// 			"company": output,
// 		},
// 		fiber.StatusCreated)
// }
