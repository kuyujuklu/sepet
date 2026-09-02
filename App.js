import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, BackHandler, StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { WebView } from "react-native-webview";
import { registerForPushNotificationsAsync, setForeground } from "./src/notifications";

// Points at the existing courier web app (admin-front's /courier feature) -
// nothing about that UI is reimplemented here, this is only a shell that
// adds real push notifications on top of it. Swap for a local dev server
// URL (e.g. http://<lan-ip>:3000/courier) while developing this shell.
const COURIER_WEB_URL = "https://sepet.md/courier";

// Set before the page's own JS runs, on every load - admin-front's
// CourierNativeBridge (src/features/courier/CourierNativeBridge.jsx) checks
// this to know it's running inside this wrapper instead of a normal browser.
const INJECTED_BEFORE_LOAD = "window.__SEPET_COURIER_APP__ = true; true;";

export default function App() {
  const webviewRef = useRef(null);
  const pendingPushToken = useRef(null);
  const isAuthReady = useRef(false);

  const [webviewUrl, setWebviewUrl] = useState(COURIER_WEB_URL);

  const sendToPage = useCallback((js) => {
    webviewRef.current?.injectJavaScript(js);
  }, []);

  const deliverPushTokenIfReady = useCallback(() => {
    if (!isAuthReady.current || !pendingPushToken.current) return;
    const token = JSON.stringify(pendingPushToken.current);
    sendToPage(
      `window.__sepetHandlePushToken && window.__sepetHandlePushToken(${token}); true;`
    );
  }, [sendToPage]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (!token) return;
      pendingPushToken.current = token;
      deliverPushTokenIfReady();
    });
  }, [deliverPushTokenIfReady]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      setForeground(state === "active");
    });
    return () => sub.remove();
  }, []);

  // Cold start from a tapped notification.
  useEffect(() => {
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const orderID = response.notification.request.content.data?.orderID;
      if (orderID) setWebviewUrl(`${COURIER_WEB_URL}/orders`);
    });
  }, []);

  // Tapped while running (foreground or background).
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const orderID = response.notification.request.content.data?.orderID;
      if (!orderID) return;

      if (webviewRef.current) {
        sendToPage(
          "window.__sepetHandleDeepLink && window.__sepetHandleDeepLink(); true;"
        );
      } else {
        setWebviewUrl(`${COURIER_WEB_URL}/orders`);
      }
    });
    return () => sub.remove();
  }, [sendToPage]);

  const handleMessage = useCallback(
    (event) => {
      let body;
      try {
        body = JSON.parse(event.nativeEvent.data);
      } catch (e) {
        return;
      }

      if (body.type === "AUTH_READY") {
        isAuthReady.current = true;
        deliverPushTokenIfReady();
      }
    },
    [deliverPushTokenIfReady]
  );

  // Android back button should navigate the web app back, not exit the app.
  const handleAndroidBack = useCallback(() => {
    webviewRef.current?.goBack();
    return true;
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", handleAndroidBack);
    return () => sub.remove();
  }, [handleAndroidBack]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <WebView
          ref={webviewRef}
          source={{ uri: webviewUrl }}
          style={styles.webview}
          injectedJavaScriptBeforeContentLoaded={INJECTED_BEFORE_LOAD}
          onMessage={handleMessage}
          onNavigationStateChange={() => {
            // A real navigation (not postMessage) means the page reloaded -
            // it will re-run INJECTED_BEFORE_LOAD and re-mount the bridge,
            // so auth has to be re-confirmed via a fresh AUTH_READY message.
            isAuthReady.current = false;
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  webview: {
    flex: 1,
  },
});
