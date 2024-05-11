import * as SecureStore from "expo-secure-store";
import { appErrors } from "../../../app/errors/appErrors";
import { convertRespError } from "../../../app/errors/convertApiErrors";
import { ENV } from "../../../constants/env/env";

export const refreshToken = async () => {
  const token = await SecureStore.getItemAsync("refresh_token");

  console.log("REFRESSSSSSSSSSSSSSSSSSSSING TOKEN: ", token);

  if (!token) {
    return {
      ok: false,
      err: appErrors.unauthorized,
    };
  }

  const reqBody = JSON.stringify({ refresh_token: token });
  const resp = await fetch(
    ENV.API_HTTP_URL +
      "/api/client/authentication/refresh-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: reqBody,
    },
  ).catch((err) => {
    console.log(err);
  });

  let err;
  const body = await resp.json().catch((e) => {
    err = e;
  });

  if (err || !body) {
    return {
      ok: false,
      err: appErrors.something_went_wrong,
    };
  }
  console.log("REFRESSSSSSSSSSSSSSSSSSSSING TOKEN reSP: ", body);

  if (body.ok) {
    return {
      ok: true,
      accesstoken: body.accesstoken,
    };
  }

  if (!body.ok) {
    return {
      ok: false,
      err: convertRespError(body.err),
    };
  }
};
