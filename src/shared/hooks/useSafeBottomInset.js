import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// react-native-safe-area-context has been observed under-reporting
// insets.bottom on Android in this app - a real system-bar gap measured as
// ~0 (see the BottomSheet fix, changes/2026-08-26-first-screen-controls-orders-safe-areas.md).
// 64 is that same fix's floor, carried here so every bottom-anchored bar/button
// uses one number instead of each screen guessing its own.
const MIN_ANDROID_BOTTOM_INSET = 64;

// For a `position: "absolute"` element pinned to the bottom of the screen:
// resolves the actual pixels to clear the system bar by, instead of trusting
// an ancestor's `paddingBottom` to reach it (absolute positioning may not
// resolve against that padding at all - see the callers of this hook for why
// that reliance was the original bug). `gap` is extra breathing room added on
// top of the safe inset, e.g. the 12px between a floating pill and the edge.
//
// Two different uses, do not mix them up (this exact mix-up was a bug once,
// see changes/2026-08-27-bottom-bar-flush-to-edge.md):
//  - Floating pill (Home's BasketFloatingBar/ActiveOrdersFloatingBar,
//    PubInfoPage's basket shortcut) - apply the result to `bottom` so the
//    whole pill floats up, with a real gap below it. That gap is the point.
//  - Full-width opaque bar (BasketPage/CreateOrder's bottomBar) - keep
//    `bottom: 0` and apply the result to `paddingBottom` *inside* the bar
//    instead, so the bar's own background still reaches the true edge and
//    only its content moves up to clear the nav bar. Using `bottom` here
//    leaves a gap with the page's own content showing through it.
export const useSafeBottomInset = (gap = 0) => {
  const insets = useSafeAreaInsets();

  const inset =
    Platform.OS === "android"
      ? Math.max(insets.bottom, MIN_ANDROID_BOTTOM_INSET)
      : insets.bottom;

  return inset + gap;
};
