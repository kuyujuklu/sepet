import { KeyboardAvoidingView, VStack, View } from "native-base";
import MyAlert from "./MyAlert";
import { useSelector } from "react-redux";
import { selectAlerts } from "../../features/store/alerts/alertSlice";
import { Platform } from "react-native";

const AlertWrapper = () => {
  const alerts = useSelector(selectAlerts);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      position={"absolute"}
      bottom={0}
      pb="20"
      maxW={400}
    >
      <VStack space="2" bottom={Platform.OS === "ios" ? 20 : 0} flexDir={"column-reverse"} pl={"1"}>
        {alerts?.map((alert) => {
          return (
            <MyAlert
              key={alert.id}
              id={alert.id}
              status={alert.status}
              title={alert.title}
              delay={alert.delay}
            />
          );
        })}
      </VStack>
    </KeyboardAvoidingView>
  );
};

export default AlertWrapper;
