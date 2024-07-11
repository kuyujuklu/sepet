"use client"
import { Provider } from "react-redux"
import { store } from "./store"
import BasketPreloader from "./BasketPreloader"

const StoreProvider = ({children}) => {
  return (
    <Provider store={store}>
        <BasketPreloader />
            {children}
    </Provider>
)

}

export default StoreProvider