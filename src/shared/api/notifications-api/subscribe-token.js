import { ENV } from "../../../constants/env/env";
import { Platform } from "react-native";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export const subscribeNotificationTokenOnServer = async (
  phone,
  deviceId,
  token,
  lang,
) => {
  console.log("phone: ", phone, " TOKEN: ", token);

  const requestBody = JSON.stringify({ phone, device_id: deviceId, token, lang });
  const subscribeResponse = await fetch(
    ENV.API_HTTP_URL + "/api/client/notifications/subscribe",
    {
      method: "POST",
      body: requestBody,
      headers: {
        "Content-type": "application/json",
      },
    },
  );
  let error = null;
  let body = await subscribeResponse.json().catch((err) => (error = err));

  if (error !== null) {
    console.log("EXPO SUBSCRIBING body parsing error");
    return {
      ok: false,
      err: "parsing error",
    };
  }

  if (body.ok) {
    console.log("EXPO SUBSCRIBING SUCCESS");
    return {
      ok: true,
      token: body.token,
    };
  }

  console.log("EXPO SUBSCRIBING TOKEN UNKNOWN ERROR: ", body.err);

  return {
    ok: false,
    err: "unknown error",
  };
};
