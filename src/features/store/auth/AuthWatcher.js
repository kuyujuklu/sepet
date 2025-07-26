import { useDispatch, useSelector } from "react-redux";
import {
  authSelectIsAuthRequiredAtApplicationStart,
  authSelectSetIsRequiringAuthentication,
  selectRefetchClient,
  setClient,
  setIsRequiringAuthentication,
  setRefetchClient,
} from "./authSlice";
import { useEffect } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import { refreshToken } from "../../../shared/api/auth/refreshToken";

export const refetchActions = {
  go_to_registration: "go_to_registration",
  continue_as_guest: "continue_as_guest",
}

const AuthWatcher = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const refetchClient = useSelector(selectRefetchClient);
  const isAuthRequiredAtApplicationStart = useSelector(
    authSelectIsAuthRequiredAtApplicationStart,
  );

  const authenticate = async (authFailAction) => {
    const resp = await refreshToken();
    if (!resp?.ok || !resp.accesstoken) {
      dispatch(setRefetchClient(false));
      if (authFailAction === refetchActions.go_to_registration) {
        navigator.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "Registration" }],
          }),
        );
        return;
      }
      if(authFailAction === refetchActions.continue_as_guest) {
        dispatch(
          setClient({ phone: "guest account", name: "Guest", isGuest: true }),
        );
        return;
      }
    }

    setaccesstoken(resp.accesstoken);
    dispatch(
      setClient({
        phone: resp.client?.phone,
        name: resp.client?.name,
        isGuest: false,
      }),
    );
    dispatch(setRefetchClient(false));
  };

  useEffect(() => {
    console.log(
      " AUTH REQUIRED at app start ",
      isAuthRequiredAtApplicationStart,
    );
    if (isAuthRequiredAtApplicationStart) {
      authenticate(refetchActions.go_to_registration);
    }
    else {
      authenticate(refetchActions.continue_as_guest);
    }

  }, [isAuthRequiredAtApplicationStart]);

  useEffect(() => {
    if (refetchClient) {
      authenticate(refetchActions.go_to_registration);
    }
  }, [refetchClient]);

  const isRequiringAuthentication = useSelector(
    authSelectSetIsRequiringAuthentication,
  );

  // Redirect to registration page if authentication is required
  useEffect(() => {
    if (!isRequiringAuthentication) return;
    dispatch(setIsRequiringAuthentication(false));
    setaccesstoken("");
    navigator.navigate("Registration");
  }, [isRequiringAuthentication]);

  return <></>;
};

export default AuthWatcher;
