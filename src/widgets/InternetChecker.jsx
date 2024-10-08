import { useNetInfo } from "@react-native-community/netinfo";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { alertStatuses, pushAlert } from "../features/store/alerts/alertSlice";

const InternetChecker = () => {
  const dispatch = useDispatch();
  const netInfo = useNetInfo();
  console.log("NET INFO: ", netInfo);
  const navigator = useNavigation();

  useEffect(() => {
    if (!netInfo) return;
    if (netInfo.isConnected === false) {
      dispatch(
        pushAlert({
          title: 
            "Нет интернета, приложение не может нормально функционировать, подключитесь к сети и перезагрузите приложение",
          status: alertStatuses.error,
          delay: 4000,
        }),
      );
    }
  }, [netInfo]);
  return <></>;
};

export default InternetChecker;
