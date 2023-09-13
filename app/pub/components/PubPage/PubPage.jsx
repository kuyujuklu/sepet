"use client";

import { createContext, useEffect, useRef, useState } from "react";
import PubPageUpper from "./PubPageUpper";
import PubPageInfo from "./PubPageInfo";
import { store } from "../../store/store";
import { Provider, useDispatch } from "react-redux";
import MenuDownPanel from "../DownPanel/MenuDownPanel";
import { usePathname } from "next/navigation";
import BasketDownPanel from "../DownPanel/BasketDownPanel";
import { setData } from "../../store/pubInfoSlice";
import NoSSR from "react-no-ssr";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";

export const ThemeContext = createContext({
    theme: "light",
    textColor: "#000000",
    bgColor: "#ffffff",
});

export const PubColorContext = createContext("");

export default function PubPage({
    data,
    children,
    hasDownPanel,
    downPanelData,
}) {
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

    const downPanelRef = useRef(null);
    const [downPanelHeight, setDownPanelHeight] = useState(0);

    useEffect(() => {
        if (!downPanelRef?.current) return;

        setDownPanelHeight(downPanelRef.current.clientHeight);
        const resizeObserver = new ResizeObserver(() => {
            if (downPanelRef?.current) {
                setDownPanelHeight(downPanelRef.current.clientHeight + 20);
            }
        });

        resizeObserver.observe(downPanelRef.current);
        return () => resizeObserver.disconnect(); // clean up
    }, [downPanelRef]);

    return (
        <Provider store={store}>
            <ThemeContext.Provider value={theme}>
                <PubColorContext.Provider value={pubColorValue}>
                    <NoSSR
                        onSSR={
                            <div className="h-full w-full flex items-center justify-center">
                                <WhiteSpinner />
                            </div>
                        }
                    >
                        {data?.pub && (
                            <>
                                <DataToStateUploader data={data} />
                                {/* wrapper */}
                                <div
                                    style={{
                                        fontFamily: "Rubik, sans-serif",
                                        width: "100vw",
                                        height: "100vh",
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
                                            minHeight: "200px",
                                        }}
                                        className={
                                            "relative rounded-3xl h-full"
                                        }
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
                                                        height: downPanelHeight,
                                                        width: "100%",
                                                    }}
                                                ></div>
                                            )}
                                        </div>
                                        {hasDownPanel && (
                                            <>
                                                {isChoosingFood ? (
                                                    <MenuDownPanel
                                                        pubID={data.pub.id}
                                                        data={downPanelData}
                                                        ref={downPanelRef}
                                                    />
                                                ) : (
                                                    <BasketDownPanel
                                                        pubID={data.pub.id}
                                                        ref={downPanelRef}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </NoSSR>
                </PubColorContext.Provider>
            </ThemeContext.Provider>
        </Provider>
    );
}

const DataToStateUploader = ({ data }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (data) dispatch(setData(data));
    }, [data, dispatch]);
};
