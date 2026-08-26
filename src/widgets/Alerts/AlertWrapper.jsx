import { KeyboardAvoidingView, VStack, View } from "native-base";
import MyAlert from "./MyAlert";
import { useSelector } from "react-redux";
import { selectAlerts } from "../../features/store/alerts/alertSlice";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AlertWrapper = () => {
  const insets = useSafeAreaInsets();
  const alerts = useSelector(selectAlerts);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      position={"absolute"}
      bottom={0}
      pb="4"
      maxW={400}
    >
      <VStack space="2" bottom={insets.bottom} flexDir={"column-reverse"} pl={"1"}>
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
