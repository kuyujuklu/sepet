import { View } from "native-base";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectClient } from "../../features/store/auth/authSlice";
import { useHasActiveOrder } from "../../shared/hooks/useHasActiveOrder";
import { events, track } from "../../shared/analytics/analytics";

// Round entry point to the profile screen. Drawn from two Views instead of an
// icon asset - there is no person icon in assets/images.
const ProfileButton = () => {
  const navigator = useNavigation();
  const client = useSelector(selectClient);
  const hasActiveOrder = useHasActiveOrder();

  const openProfile = () => {
    track(events.profileOpened, { is_guest: !!client?.isGuest });
    navigator.navigate("Profile");
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={openProfile}>
      <View>
        <View
          w={10}
          h={10}
          borderRadius="full"
          backgroundColor="emerald.600"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <View w={2.5} h={2.5} borderRadius="full" backgroundColor="#fff" />
          <View
            w={5}
            h={2.5}
            mt={0.5}
            mb={-1}
            borderTopRadius="full"
            backgroundColor="#fff"
          />
        </View>

        {/* An order is on its way (has_active_order). A dot, not a count: the
            orders screen is one tap away and it is the thing that lists them */}
        {hasActiveOrder && (
          <View
            position="absolute"
            top={-1}
            right={-1}
            w={3}
            h={3}
            borderRadius="full"
            borderWidth={2}
            borderColor="#f5f5f5"
            backgroundColor="#1d4ed8"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProfileButton;
