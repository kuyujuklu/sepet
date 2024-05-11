import { useDispatch, useSelector } from "react-redux";
import {
  handleErrorStandard,
  selectStandardHandlingError,
} from "./errorHandlingSlice";
import { useEffect } from "react";
import { pushAlert } from "../alerts/alertSlice";
import { appErrors } from "../../../app/errors/appErrors";
import { useTranslation } from "react-i18next";

const StandardErrorHandler = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const error = useSelector(selectStandardHandlingError);

  useEffect(() => {
    if (!error) return;

    if (!error.text) {
      dispatch(
        pushAlert({
          title: t(appErrors.something_went_wrong),
          status: "error",
          delay: 3000,
        }),
      );
      dispatch(handleErrorStandard(null));
      return;
    }

    dispatch(
      pushAlert({
        title: t(error.text),
        status: "error",
        delay: 3000,
      }),
    );

    dispatch(handleErrorStandard(null));
  }, [error]);

  return <></>;
};

export default StandardErrorHandler;
