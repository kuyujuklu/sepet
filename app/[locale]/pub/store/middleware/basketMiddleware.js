import { createListenerMiddleware } from "@reduxjs/toolkit";
import {
    clearBasket,
    decreaseDishAmount,
    increaseDishAmount,
    setBasket,
    setBasketPubID,
    setLastOrder,
} from "../basketSlice";
import { store } from "../store";

const write = (store) => {
    if (!store?.getState().basketSlice?.dishes) return;
    console.log("write", store);
    localStorage.setItem(
        "basket",
        JSON.stringify(store.getState().basketSlice.dishes)
    );
    localStorage.setItem("lastBasketAction", new Date().getTime());
};

const writeLastOrder = (store) => {
    if (!store?.getState().basketSlice?.lastOrder) return;
    console.log(
        "setting last order in local storage: ",
        JSON.stringify(store.getState().basketSlice.lastOrder)
    );
    localStorage.setItem(
        "lastOrder",
        JSON.stringify(store.getState().basketSlice.lastOrder)
    );
};

export const listenToIncreaseDishAmount = createListenerMiddleware();
listenToIncreaseDishAmount.startListening({
    actionCreator: increaseDishAmount,
    effect: () => write(store),
});
export const listenToDecreaseDishAmout = createListenerMiddleware();
listenToDecreaseDishAmout.startListening({
    actionCreator: decreaseDishAmount,
    effect: () => write(store),
});
export const listenToClearBasket = createListenerMiddleware();
listenToClearBasket.startListening({
    actionCreator: clearBasket,
    effect: () => write(store),
});
export const listenToSetBasket = createListenerMiddleware();
listenToSetBasket.startListening({
    actionCreator: setBasket,
    effect: () => write(store),
});
export const listenToChangePubID = createListenerMiddleware();
listenToChangePubID.startListening({
    actionCreator: setBasketPubID,
    effect: () => write(store),
});
export const listenToSetLastOrder = createListenerMiddleware();
listenToSetLastOrder.startListening({
    actionCreator: setLastOrder,
    effect: () => writeLastOrder(store),
});

export const basketMiddleware = [
    listenToIncreaseDishAmount.middleware,
    listenToDecreaseDishAmout.middleware,
    listenToClearBasket.middleware,
    listenToChangePubID.middleware,
    listenToSetLastOrder.middleware,
];
