"use client";

import { createContext, useEffect, useState } from "react";
import PubPageUpper from "./PubPageUpper";
import PubPageInfo from "./PubPageInfo";
import { store } from "../../store/store";
import { Provider, useDispatch } from "react-redux";
import MenuDownPanel from "../DownPanel/MenuDownPanel";
import { usePathname } from "next/navigation";
import BasketDownPanel from "../DownPanel/BasketDownPanel";
import { setData } from "../../store/pubInfoSlice";
import NoSSR from "react-no-ssr";
import SomethingWentWrong from "@/app/shared-components/Errors/SomethingWentWrong";
import { setBasketPubID } from "../../store/basketSlice";
import CreateOrderPopup from "../Order/CreateOrderPopup";

export const ThemeContext = createContext({
    theme: "light",
    textColor: "#000000",
    bgColor: "#ffffff",
});

export const PubColorContext = createContext("");

import "../../i18n"
import { useTranslation } from "react-i18next";

function PubPage({
    data,
    children,
    hasDownPanel,
    downPanelData,
}) {
    const {i18n} = useTranslation()
    const pathname = usePathname();
    const isChoosingFood = !pathname.includes("basket");

    const [theme, setTheme] = useState({
        theme: "light",
        textColor: "#000000",
        bgColor: "#ffffff",
    });

    const [pubColorValue, setPubColorValue] = useState("#ffffff");

    useEffect(() => {
        if (data?.pub) {
            if (data.pub.color_theme === "dark") {
                setTheme({
                    theme: "dark",
                    textColor: "#eeefff",
                    bgColor: "rgb(17 24 39)",
                });
                setPubColorValue(data.pub.color ?? "#eeefff");
                let htmlNode = document.querySelector("html");
                if (htmlNode) htmlNode = "rgb(17 24 39)";
            } else {
                setTheme({
                    theme: "light",
                    textColor: "#000000",
                    bgColor: "#eeefff",
                });
                setPubColorValue(data.pub.color ?? "#000000");
                let htmlNode = document.querySelector("html");
                if (htmlNode) htmlNode = "#cccccc";
            }
        }
    }, [data?.pub]);

    useEffect(() => {
        (async function () {
            if (i18n.language === "ru-RU" || i18n.language === "ru") {
                i18n.changeLanguage("ru");
                return
            }
            if (i18n.language === "ro-RO" || i18n.language === "ro") {
                i18n.changeLanguage("ro");
                return
            }
            i18n.changeLanguage("ru");
        })();
    }, [i18n]);
    
    if (data?.pub?.expired) return <SomethingWentWrong />;

   

    return (
        <NoSSR
            onSSR={
                <div className="h-full w-full flex items-center justify-center"></div>
            }
        >
            <Provider store={store}>
                <ThemeContext.Provider value={theme}>
                    <PubColorContext.Provider value={pubColorValue}>
                        {data?.pub && (
                            <div>
                                <DataToStateUploader data={data} />
                                {/* wrapper */}
                                <div
                                    style={{
                                        fontFamily: "Rubik, sans-serif",
                                        minHeight: "100vh",
                                        background:
                                            theme.theme === "light"
                                                ? "#cccccc"
                                                : "#222222",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "Rubik, sans",
                                            maxWidth: "600px",
                                            margin: "auto",
                                            height: "100%",
                                            background: theme.bgColor,
                                            minHeight: "100vh",
                                            paddingBottom: "160px",
                                        }}
                                        className={"relative rounded-3xl"}
                                    >
                                        <PubPageUpper pub={data.pub} />
                                        <div
                                            style={{
                                                fontFamily: "Rubik, sans",
                                                display: "block",
                                                position: "relative",
                                                top: "160px",
                                                padding: "20px",
                                                zIndex: 10,
                                                background: theme.bgColor,
                                            }}
                                            className="rounded-2xl p-5"
                                        >
                                            {isChoosingFood && (
                                                <PubPageInfo pub={data.pub} />
                                            )}

                                            {children}

                                            {hasDownPanel && (
                                                //down panel phantom box to keep the page height
                                                <div
                                                    style={{
                                                        height: "150px",
                                                        width: "100%",
                                                    }}
                                                ></div>
                                            )}
                                        </div>
                                        {hasDownPanel && (
                                            <>
                                                {isChoosingFood ? (
                                                    <MenuDownPanel
                                                        pubID={data.pub.url_name}
                                                        data={downPanelData}
                                                    />
                                                ) : (
                                                    <BasketDownPanel
                                                        pubID={data.pub.url_name}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* POPUPS */}
                        <CreateOrderPopup />
                    </PubColorContext.Provider>
                </ThemeContext.Provider>
            </Provider>
        </NoSSR>
    );
}

const DataToStateUploader = ({ data }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (data) dispatch(setData(data));
        if (data?.pub) {
            console.log("set basket pub id", data.pub.id);
            dispatch(setBasketPubID(data.pub.id));
        }
    }, [data, dispatch]);
    return <></>;
};

export default PubPage