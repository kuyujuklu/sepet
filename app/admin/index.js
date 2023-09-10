"use client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./store/store";
import { BrowserRouter } from "react-router-dom";

import "./i18n";

const Index = () => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </Provider>
    );
};

export default Index;
