"use client";
import { Provider } from "react-redux";
import App from "./App";
import { store } from "./store/store";
import { BrowserRouter } from "react-router-dom";

import "./i18n";
import NoSSR from "react-no-ssr";
import FullPageSpinner from "./components/loaders/FullPageSpinner";

const Index = () => {
    return (
        <NoSSR onSSR={<FullPageSpinner />}>
            <Provider store={store}>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Provider>
        </NoSSR>
    );
};

export default Index;
