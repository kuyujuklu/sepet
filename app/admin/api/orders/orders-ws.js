import { ENV } from "@/next.config";
import { appErrors } from "../../errors/errors";
import { accesstoken } from "../auth/authBasedQuery";

let socket = null
let socketsPubID = null
let socketsCompanyID = null;
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

const configureSocket = (companyID, pubID) => {
  if(!accesstoken) return;

  // socket = new WebSocket(`ws://${document.location.host}/ws/orders/company/${companyID}/pub/${pubID}`);
  socket = new WebSocket(`${process.env.IS_DEV ? "ws" : "wss"}://${process.env.API_SERV ?? window.location.host}/ws/orders/company/${companyID}/pub/${pubID}?access_token=${accesstoken}`);
  setConnection({state: SOCKET_IS_CONNECTING_STATE, error: null})

  socket.onopen = (e) => {
    console.log("Connection opened")
    setConnection({state: SOCKET_CONNECTED_STATE, error: null})
  };

  socket.onmessage = onMessage

  socket.onclose = (event) => {
    setConnection({state: SOCKET_ERROR_STATE, error: appErrors.unknown_error})
  };

  socket.onerror = (error) => {
    setConnection({state: SOCKET_ERROR_STATE, error: appErrors.unknown_error})
  };
}

//On successfully receive data uses callback from parameters
export const subscribeOnOrdersWebSocket = (companyID, pubID, /*callback*/uploadReceivedData, /*callback*/setConnection) => {

  let socketIsInvalid = socket === null || companyID !== socketsCompanyID || pubID !== socketsPubID 
  if(socketIsInvalid) {
    socketsPubID = pubID;
    socketsCompanyID = companyID;

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