import { useDispatch, useSelector } from "react-redux";
import {
  authSelectIsAuthRequiredAtApplicationStart,
  authSelectSetIsRequiringAuthentication,
  setIsRequiringAuthentication,
} from "./authSlice";
import { useEffect } from "react";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { setaccesstoken } from "../../../shared/api/auth/authBasedQuery";
import { refreshToken } from "../../../shared/api/auth/refreshToken";

const AuthWatcher = () => {
  const dispatch = useDispatch();
  const navigator = useNavigation();

  const isAuthRequiredAtApplicationStart = useSelector(
    authSelectIsAuthRequiredAtApplicationStart
  );

  //Check on startup if authentication is required
  useEffect(() => {
    if (isAuthRequiredAtApplicationStart) {
      (async function () {
        const resp = await refreshToken();
        if (!resp?.ok || !resp.accesstoken) {
          navigator.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Registration" }],
            })
          )
          return;
        }

        setaccesstoken(resp.accesstoken);
      })();
    }
  }, [isAuthRequiredAtApplicationStart]);
  
  const isRequiringAuthentication = useSelector(
    authSelectSetIsRequiringAuthentication
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
