import { createListenerMiddleware } from "@reduxjs/toolkit";
import { clearBasket, decreaseDishAmount, increaseDishAmount, setBasketPubID } from "../basketSlice";
import { store } from "../store";

const write = (store) => {
    if(!store?.getState().basketSlice?.dishes) return;
    console.log("write", store);
    localStorage.setItem("basket", JSON.stringify(store.getState().basketSlice.dishes));
    localStorage.setItem("lastBasketAction", new Date().getTime());
}

export const listenToIncreaseDishAmount = createListenerMiddleware();
listenToIncreaseDishAmount.startListening({
    actionCreator: increaseDishAmount,
    effect: () => write(store),
})
export const listenToDecreaseDishAmout = createListenerMiddleware();
listenToDecreaseDishAmout.startListening({
    actionCreator: decreaseDishAmount,
    effect: () => write(store),
})
export const listenToClearBasket = createListenerMiddleware();
listenToClearBasket.startListening({
    actionCreator: clearBasket,
    effect: () => write(store),
})
export const listenToChangePubID = createListenerMiddleware();
listenToChangePubID.startListening({
    actionCreator: setBasketPubID,
    effect: () => write(store),
})

export const basketMiddleware = [listenToIncreaseDishAmount.middleware, listenToDecreaseDishAmout.middleware, listenToClearBasket.middleware, listenToChangePubID.middleware];
