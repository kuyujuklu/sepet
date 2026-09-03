import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscribeToNotificationsMutation } from "../../api/courier/courier";

// Renders nothing. Exists only to talk to the courier-app Expo wrapper
// (see courier-app/) when this page is loaded inside its WebView instead of
// a normal browser: the wrapper sets window.__SEPET_COURIER_APP__ = true via
// injectedJavaScriptBeforeContentLoaded before this page's JS runs, so
// everything here is a no-op in a regular browser tab.
const CourierNativeBridge = ({ courierID }) => {
  const [subscribeToNotifications] = useSubscribeToNotificationsMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!courierID || !window.__SEPET_COURIER_APP__) return;

    // Called by the wrapper (via injectJavaScript) once it has an Expo push
    // token - registering it here reuses this page's own auth instead of
    // making the native shell handle the courier's session token.
    window.__sepetHandlePushToken = (token, lang) => {
      subscribeToNotifications({ courierID, token, lang: lang || "ru" });
    };

    // Called by the wrapper when a push notification is tapped. No per-order
    // deep link target exists in the UI yet, so this always lands on the
    // orders list - the order itself is already visible there.
    window.__sepetHandleDeepLink = () => {
      navigate("/courier/orders");
    };

    window.ReactNativeWebView?.postMessage(
      JSON.stringify({ type: "AUTH_READY", courierID })
    );

    return () => {
      delete window.__sepetHandlePushToken;
      delete window.__sepetHandleDeepLink;
    };
  }, [courierID, subscribeToNotifications, navigate]);

  return null;
};

export default CourierNativeBridge;
