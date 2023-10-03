import { useDispatch, useSelector } from "react-redux";
import PubErrorsHandler from "./pub/PubErrorsHandler";
import {
    selectStandardHandlingError,
    setStandardHandlingError,
} from "./errorHandlerSlice";
import { useEffect } from "react";
import { pushAlert } from "../alerts/alertSlice";
import { useTranslation } from "react-i18next";
import { appErrors } from "../../errors/errors";
import { requireAuthentication } from "../auth/authSlice";
import MenuErrorsHandler from "./menu/MenuErrorsHandler";
import CategoryErrorsHandler from "./category/CategoryErrorsHandler";
import DishErrorsHandler from "./dish/DishErrorsHandler";

const ErrorHandlers = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const standardHandlingError = useSelector(selectStandardHandlingError);

    useEffect(() => {
        if (!standardHandlingError) return;

		if(standardHandlingError.text === appErrors.unauthorized) {
			dispatch(requireAuthentication())
		}

        dispatch(pushAlert({
            message: t(standardHandlingError.text),
			type: "danger",
			delay: 3000,
        }))
        dispatch(setStandardHandlingError(null));

	}, [dispatch, standardHandlingError, t]);

    return (
        <>
            <PubErrorsHandler />
            <MenuErrorsHandler />
            <CategoryErrorsHandler />
            <DishErrorsHandler />
        </>
    );
};

export default ErrorHandlers;
