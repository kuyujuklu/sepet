import { Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SCREEN_PADDING } from "../../constants/layout";
import { usePopupExclusive } from "../../shared/hooks/usePopupExclusive";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SCREEN_PADDING,
    // The old popups left this transparent, so a popup looked like it was
    // floating over a live screen with nothing dimmed behind it
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#fff",
    borderRadius: 26,
    paddingTop: 12,
    paddingBottom: 20,
    // Every popup is centered now, including the ones that hold a long list
    // (all categories, saved addresses): capped instead of letting the box
    // grow to the content, so it stays a dialog and the list scrolls inside
    // it (see `scrollable`) rather than pushing the box off-screen.
    maxHeight: "80%",
    overflow: "hidden",
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

// Every popup in the app is a centered dialog, so they all come from here:
// same dimmed backdrop, same radius, same width cap.
//
// `id` must be a stable string unique to this popup (e.g. "removeDish") - it
// is what usePopupExclusive uses to tell "a second popup is opening" apart
// from "this same popup re-rendered", so two BottomSheets can never both be
// visible at once.
const BottomSheet = ({
  id,
  isOpened,
  onClose,
  title,
  subtitle,
  showClose = true,
  scrollable = false,
  children,
}) => {
  usePopupExclusive(id, isOpened, onClose);

  const body = <View style={styles.body}>{children}</View>;

  return (
    <Modal
      visible={!!isOpened}
      transparent
      animationType="fade"
      // Both flags together, or on Android the modal window stops at the
      // navigation bar and leaves an undimmed strip of the screen below the
      // dialog. `navigationBarTranslucent` requires `statusBarTranslucent`.
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Taps inside the dialog must not close it. Sizing the dialog box
            directly on this Pressable (rather than nesting another View
            inside it) is what lets `width: "100%"` below resolve against
            `overlay` (a flex:1 container) and actually get capped+centered -
            a shrink-wrapped wrapper in between would leave nothing for the
            percentage to resolve against. */}
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
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
