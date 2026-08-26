import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREEN_PADDING } from "../../constants/layout";

// Enough to cover a three-button navigation bar; never visible when the sheet
// already reaches the bottom of the screen.
const BOTTOM_OVERSHOOT = 64;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    // The old popups left this transparent, so a sheet looked like it was
    // floating over a live screen with nothing dimmed behind it
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
    maxHeight: "92%",
    // The modal window and the app window do not agree on where the bottom of
    // the screen is on Android (the app is edge-to-edge, the dialog is a
    // separate window), and the sheet ended up floating a navigation bar's
    // worth of height above the bottom edge, with the dimmed screen showing
    // through underneath. So the white box is deliberately taller than its
    // layout box: the negative margin pushes it down past the bottom, the
    // padding gives the content those pixels back. If there is no strip to
    // cover, the extra height is simply clipped by the window.
    marginBottom: -BOTTOM_OVERSHOOT,
    paddingBottom: BOTTOM_OVERSHOOT,
    overflow: "hidden",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d4d4d8",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: SCREEN_PADDING + 4,
    paddingTop: 16,
  },
  titles: { flex: 1, gap: 4 },
  title: { fontSize: 20, fontWeight: "bold", color: "#111" },
  subtitle: { fontSize: 14, color: "#6b7280", lineHeight: 19 },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f2f4",
    alignItems: "center",
    justifyContent: "center",
  },
  closeSign: { fontSize: 17, lineHeight: 19, color: "#52525b" },
  body: { paddingHorizontal: SCREEN_PADDING + 4, paddingTop: 16 },
});

// Every popup in the app is a bottom sheet, so they all come from here:
// same dimmed backdrop, same radius, same handle, same safe-area padding.
const BottomSheet = ({
  isOpened,
  onClose,
  title,
  subtitle,
  showClose = true,
  scrollable = false,
  children,
}) => {
  const insets = useSafeAreaInsets();

  const body = (
    <View style={[styles.body, { paddingBottom: insets.bottom + 20 }]}>
      {children}
    </View>
  );

  return (
    <Modal
      visible={!!isOpened}
      transparent
      animationType="slide"
      // Both flags together, or on Android the modal window stops at the
      // navigation bar and leaves an undimmed strip of the screen below the
      // sheet. `navigationBarTranslucent` requires `statusBarTranslucent`.
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Taps inside the sheet must not close it */}
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {(!!title || showClose) && (
              <View style={styles.header}>
                <View style={styles.titles}>
                  {!!title && <Text style={styles.title}>{title}</Text>}
                  {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>

                {showClose && (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onClose}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <View style={styles.close}>
                      <Text style={styles.closeSign}>✕</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {scrollable ? (
              <ScrollView showsVerticalScrollIndicator={false}>{body}</ScrollView>
            ) : (
              body
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const buttonStyles = StyleSheet.create({
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#059669" },
  secondary: { backgroundColor: "#f2f2f4" },
  danger: { backgroundColor: "#dc2626" },
  label: { fontSize: 16, fontWeight: "bold" },
  primaryLabel: { color: "#fff" },
  secondaryLabel: { color: "#111" },
  dangerLabel: { color: "#fff" },
});

export const SheetButton = ({ tone = "primary", onPress, children, style }) => (
  <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={style}>
    <View style={[buttonStyles.button, buttonStyles[tone]]}>
      <Text style={[buttonStyles.label, buttonStyles[`${tone}Label`]]}>
        {children}
      </Text>
    </View>
  </TouchableOpacity>
);

export default BottomSheet;
