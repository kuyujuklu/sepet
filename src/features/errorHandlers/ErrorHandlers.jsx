import { useDispatch, useSelector } from "react-redux";
import PubErrorsHandler from "./pub/PubErrorsHandler";
import {
    selectStandardHandlingError,
    handleErrorStandardWay,
} from "./errorHandlerSlice";
import { useEffect } from "react";
import { pushAlert } from "../alerts/alertSlice";
import { useTranslation } from "react-i18next";
import { appErrors } from "../../errors/errors";
import { requireAuthentication } from "../auth/authSlice";
import MenuErrorsHandler from "./menu/MenuErrorsHandler";
import CategoryErrorsHandler from "./category/CategoryErrorsHandler";
import DishErrorsHandler from "./dish/DishErrorsHandler";
import CompanyErrorsHandler from "./company/CompanyErrorsHandler";
import AuthErrorsHandler from "./auth/AuthErrorsHandler";
import CourierErrorHandlers from "./courier/CourierErrorHandlers";

const ErrorHandlers = () => {
    const {t} = useTranslation();
    const dispatch = useDispatch();
    const standardHandlingError = useSelector(selectStandardHandlingError);

    useEffect(() => {
        console.log("st handling err: ", standardHandlingError)
        if (!standardHandlingError) return;

        if(!standardHandlingError.text) {
            dispatch(pushAlert({
                message: t(appErrors.something_went_wrong),
                type: "danger",
                delay: 3000,
            }))
            dispatch(handleErrorStandardWay(null));
            return
        }

        console.log("sthet: ",standardHandlingError.text)

		if(standardHandlingError.text === appErrors.unauthorized) {
            dispatch(handleErrorStandardWay(null));
			dispatch(requireAuthentication())
            return
		}

        dispatch(pushAlert({
            message: t(standardHandlingError.text),
			type: "danger",
			delay: 3000,
        }))
        dispatch(handleErrorStandardWay(null));

	}, [dispatch, standardHandlingError, t]);

    return (
        <>
            <AuthErrorsHandler />
            <CompanyErrorsHandler />
            <PubErrorsHandler />
            <MenuErrorsHandler />
            <CategoryErrorsHandler />
            <DishErrorsHandler />
            <CourierErrorHandlers />
        </>
    );
};

export default ErrorHandlers;
