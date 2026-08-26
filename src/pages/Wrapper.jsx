import { View } from "native-base";
import { Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Every screen sits inside this. Android runs edge-to-edge
// (`android.edgeToEdgeEnabled` in app.json), so the app paints *under* the
// status bar and under the gesture/navigation bar: without the insets below,
// the top bar of every screen ends up behind the clock and the bottom button
// behind the navigation pill.
const Wrapper = ({ children, style }) => {
  const insets = useSafeAreaInsets();

  // On Android the provider can report 0 before the first layout pass;
  // StatusBar.currentHeight is available immediately and never lies.
  const top =
    Platform.OS === "android"
      ? Math.max(insets.top, StatusBar.currentHeight ?? 0)
      : insets.top;

  return (
    <View
      style={{
        paddingTop: top,
        // There is no tab bar any more - only the system gesture area
        paddingBottom: insets.bottom,
        flex: 1,
        gap: 0,
        backgroundColor: "#f5f5f5",
        zIndex: 1,
        ...style,
      }}
    >
      {children}
    </View>
  );
};

export default Wrapper;
