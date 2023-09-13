import { createListenerMiddleware } from "@reduxjs/toolkit";
import { decreaseDishAmount, increaseDishAmount } from "../basketSlice";
import { store } from "../store";

const write = (store) => {
    if(!store?.getState().basketSlice?.dishes) return;
    console.log("write", store);
    localStorage.setItem("basket", JSON.stringify(store.getState().basketSlice.dishes));
}

export const listenToIncreaseDishAmount = createListenerMiddleware();
listenToIncreaseDishAmount.startListening({
    actionCreator: increaseDishAmount,
    effect: () => write(store),
})

export const listeToDecreaseDishAmout = createListenerMiddleware();
listeToDecreaseDishAmout.startListening({
    actionCreator: decreaseDishAmount,
    effect: () => write(store),
})

export const basketMiddleware = [listenToIncreaseDishAmount.middleware, listeToDecreaseDishAmout.middleware];
