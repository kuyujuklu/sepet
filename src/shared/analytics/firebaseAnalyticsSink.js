import { getApp } from "@react-native-firebase/app";
import { getAnalytics, logEvent, logScreenView } from "@react-native-firebase/analytics";
import { setAnalyticsSink, events } from "./analytics";

// The one call analytics.js's own comment says it's waiting for - wires the
// existing track()/trackScreen() catalogue to Firebase Analytics. Screen
// views go through logScreenView specifically (not a generic logEvent) so
// Firebase populates its reserved firebase_screen/firebase_screen_class
// params instead of an untyped custom one.
export const initFirebaseAnalyticsSink = () => {
  const analyticsInstance = getAnalytics(getApp());

  setAnalyticsSink((event, props) => {
    if (event === events.screenView && props?.screen) {
      logScreenView(analyticsInstance, {
        screen_name: props.screen,
        screen_class: props.screen,
      });
      return;
    }

    logEvent(analyticsInstance, event, props);
  });
};
