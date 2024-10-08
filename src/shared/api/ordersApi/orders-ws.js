import { appErrors } from "../../../app/errors/appErrors";
import { ENV } from "../../../constants/env/env";
import { accesstoken, setaccesstoken } from "../auth/authBasedQuery";
import { refreshToken } from "../auth/refreshToken";

let socketsAccessToken = "";
let socket = null;
let socketsPubID = null;
let isSocketConnecting = false;
let isSocketConnected = false;

const subscribedCallbacks = [];

const PING_MESSAGE = "PING";

export const SOCKET_CONNECTED_STATE = "SOCKET_CONNECTED";
export const SOCKET_IS_CONNECTING_STATE = "SOCKET_IS_CONNECTING";
export const SOCKET_ERROR_STATE = "SOCKET_ERROR";
export const SOCKET_DISCONNECTED_STATE = "SOCKET_DISCONNECTED";

export const CREATE_EVENT_TYPE = "CREATE_EVENT";
export const GET_ALL_EVENT_TYPE = "GET_ALL";
export const UPDATE_EVENT_TYPE = "UPDATE_EVENT";

const handlePing = () => {
  if (!socket) return;
  if (socket.readyState === 1) socket.send("PONG");
};

const onMessage = (event) => {
  if (event.data === PING_MESSAGE) {
    handlePing();
    return;
  }

  let error = null;
  let body;
  try {
    body = JSON.parse(event.data);
  } catch (e) {
    error = e;
  }

  if (error !== null) {
    console.log("Bad body from message");
    return;
  }

  const callbacks = subscribedCallbacks;
  if (!callbacks) {
    return;
  }

  for (const callbackObject of callbacks) {
    if (!callbackObject) continue;

    callbackObject.upload(body);
  }
};

let socketConnectionState = { state: SOCKET_DISCONNECTED_STATE, error: null };

const setConnection = (connectionState) => {
  const callbacks = subscribedCallbacks;
  if (!callbacks) {
    return;
  }

  socketConnectionState = connectionState;

  for (const callbackObject of callbacks) {
    if (!callbackObject) continue;

    callbackObject.setConnection(socketConnectionState);
  }
};

const configureSocket = async () => {
  console.log("CONF");
  if (isSocketConnecting || isSocketConnected) {
    return;
  }

  if (!accesstoken) {
    const resp = await refreshToken();
    if (!resp || !resp.ok) return;

    setaccesstoken(resp.accesstoken);
  }

  const host = `${ENV.WS_SCHEME}://${ENV.API_SERV}/ws/orders/client?access_token=${accesstoken}`;

  // socket = new WebSocket(`ws://${document.location.host}/ws/orders/company/${companyID}/pub/${pubID}`);
  socket = new WebSocket(host);
  isSocketConnecting = true;
  setConnection({ state: SOCKET_IS_CONNECTING_STATE, error: null });

  socket.onopen = (e) => {
    socketsAccessToken = accesstoken;
    isSocketConnected = true;
    isSocketConnecting = false;
    console.log("CONNECTION OPENED");
    setConnection({ state: SOCKET_CONNECTED_STATE, error: null });
  };

  socket.onmessage = onMessage;

  socket.onclose = (event) => {
    console.log("CONNECTION CLOSED");
    isSocketConnected = false;
    isSocketConnecting = false;
    setConnection({
      state: SOCKET_ERROR_STATE,
      error: appErrors.unknown_error,
    });
    socket = null;
  };

  socket.onerror = (error) => {
    console.log("CONNECTION ERROR");
    isSocketConnected = false;
    isSocketConnecting = false;
    setConnection({
      state: SOCKET_ERROR_STATE,
      error: appErrors.unknown_error,
    });
    socket = null;
  };
};

setInterval(() => {
  if (socketsAccessToken !== accesstoken) {
    socket = null;
    isSocketConnecting = false;
    isSocketConnected = false;
    configureSocket();
    return;
  }

  configureSocket();
}, 3000);

//On successfully receive data uses callback from parameters
export const subscribeOnOrdersWebSocket = (
  /*callback*/ uploadReceivedData,
  /*callback*/ setConnection,
) => {
  if (socket === null) {
    configureSocket();
  }

  subscribedCallbacks.push({ upload: uploadReceivedData, setConnection });
  setConnection(socketConnectionState);
};
