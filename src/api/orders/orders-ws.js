import { appErrors } from "../../errors/errors";
import { accesstoken, setaccesstoken } from "../auth/authBasedQuery";
import { refreshToken } from "../auth/refreshToken";

let socketsAccessToken = "";
let socket = null
let socketsPubID = null
let socketsCompanyID = null;
let isSocketConnecting = false;
let isSocketConnected = false;
const subscribedCallbacks = {};

const PING_MESSAGE = "PING"

export const SOCKET_CONNECTED_STATE = "SOCKET_CONNECTED"
export const SOCKET_IS_CONNECTING_STATE = "SOCKET_IS_CONNECTING"
export const SOCKET_ERROR_STATE = "SOCKET_ERROR"
export const SOCKET_DISCONNECTED_STATE = "SOCKET_DISCONNECTED"

export const CREATE_EVENT_TYPE = "CREATE_EVENT"
export const GET_ALL_EVENT_TYPE = "GET_ALL"
export const UPDATE_EVENT_TYPE = "UPDATE_EVENT"

const handlePing = () => {
  if(!socket) return;
  
  if(socket.readyState === 1)
    socket.send("PONG")
  
}

const onMessage = (event) => {

  if(event.data === PING_MESSAGE) {
    handlePing();
    return;
  }


  let error = null
  let body
  try {
    body = JSON.parse(event.data)
  } catch (e) {
    error = e
  }

  if(error !== null) {
    console.log("Bad body from message")
    return;
  }

  const callbacks = subscribedCallbacks[socketsPubID]
  if(!callbacks) {
    return;
  } 

  for(let callbackObject of callbacks) {
    if(!callbackObject) continue

    callbackObject.upload(body)
  }
}

let socketConnectionState = {state: SOCKET_DISCONNECTED_STATE, error: null}

const setConnection = (connectionState) => {
  const callbacks = subscribedCallbacks[socketsPubID]
  if(!callbacks) {
    return;
  } 

  socketConnectionState = connectionState

  for(let callbackObject of callbacks) {
    if(!callbackObject) continue

    callbackObject.setConnection(socketConnectionState)
  }
}

const configureSocket = async (companyID, pubID) => {
  if(isSocketConnecting || isSocketConnected) {
    return;
  }

  isSocketConnecting = true;

  
  const resp = await refreshToken();
  if(resp.ok) {
    console.log("REFRESHED")
    setaccesstoken(resp.accesstoken)
  }
  else {
    isSocketConnecting = false;
    return;
  }

  // socket = new WebSocket(`ws://${document.location.host}/ws/orders/company/${companyID}/pub/${pubID}`);
  socket = new WebSocket(`${process.env.NODE_ENV === "production" ? "wss" : "ws"}://${process.env.API_SERV ?? window.location.host}/ws/orders/company/${companyID}/pub/${pubID}?access_token=${accesstoken}`);
  setConnection({state: SOCKET_IS_CONNECTING_STATE, error: null})
  isSocketConnecting = true;

  socket.onopen = (e) => {
    console.log("Connection opened")
    isSocketConnected = true;
    isSocketConnecting = false;
    socketsAccessToken = accesstoken;
    setConnection({state: SOCKET_CONNECTED_STATE, error: null})
  };

  socket.onmessage = onMessage

  socket.onclose = (event) => {
    socket = null
    isSocketConnected = false;
    isSocketConnecting = false;
    setConnection({state: SOCKET_ERROR_STATE, error: appErrors.unknown_error})
  };

  socket.onerror = (error) => {
    socket = null
    isSocketConnected = false;
    isSocketConnecting = false;
    setConnection({state: SOCKET_ERROR_STATE, error: appErrors.unknown_error})
  };
}


const counterToReload = (counter) => () => {
  counter++
  console.log(counter)

  if(counter === 500) {
    window.location.reload() 
  }

    if(!socketsPubID || !socketsCompanyID) return;

    configureSocket(socketsCompanyID, socketsPubID);
}

setInterval(counterToReload(2), 4 * 1000);

//On successfully receive data uses callback from parameters
export const subscribeOnOrdersWebSocket = (companyID, pubID, /*callback*/uploadReceivedData, /*callback*/setConnection) => {

  let socketIsInvalid = socket === null || companyID !== socketsCompanyID || pubID !== socketsPubID 
  if(socketIsInvalid) {
    socketsPubID = pubID;
    socketsCompanyID = companyID; socket = null
    isSocketConnected = false;
    isSocketConnecting = false;
    setConnection({state: SOCKET_DISCONNECTED_STATE})
  

    configureSocket(companyID, pubID)  
  }

  let previousCallbacks = subscribedCallbacks[pubID]
  if(!previousCallbacks) {
    // eslint-disable-next-line no-undef
    previousCallbacks = new Set()
    subscribedCallbacks[pubID] = previousCallbacks 
  }

  setConnection(socketConnectionState)

  previousCallbacks.add({upload: uploadReceivedData, setConnection: setConnection})
} 