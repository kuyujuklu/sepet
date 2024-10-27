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

const AuthWatcher = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const refetchClient = useSelector(selectRefetchClient);
  const isAuthRequiredAtApplicationStart = useSelector(
    authSelectIsAuthRequiredAtApplicationStart,
  );

  const authenticate = async () => {
    const resp = await refreshToken();
    if (!resp?.ok || !resp.accesstoken) {
      dispatch(setRefetchClient(false));
      navigator.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Registration" }],
        }),
      );
      return;
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
    if (isAuthRequiredAtApplicationStart) {
      console.log(
        " AUTH REQUIRED at app start ",
        isAuthRequiredAtApplicationStart,
      );
      authenticate();
    }
  }, [isAuthRequiredAtApplicationStart]);

  useEffect(() => {
    if (refetchClient) {
      console.log("REFETCH CLIENT", refetchClient);
      authenticate();
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
