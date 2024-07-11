"use client";

import { useContext } from "react";
import { PubColorContext, ThemeContext } from "./ThemeContextProvider";
import PubPageInfo from "./PubPageInfo";
import MenuDownPanel from "../DownPanel/MenuDownPanel";
import BasketDownPanel from "../DownPanel/BasketDownPanel";
import PubPageUpper from "./PubPageUpper";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const ThemeWrapperForPubPage = ({
    data,
    children,
    hasDownPanel,
    downPanelData,
}) => {
    const {t} = useTranslation();
    const theme = useContext(ThemeContext);
    const pubColorContext = useContext(PubColorContext);
    const pathname = usePathname();

    const isChoosingFood = !pathname.includes("basket");

    return (
        <div
            style={{
                fontFamily: "Rubik, sans-serif",
                minHeight: "100vh",
                background: theme.theme === "light" ? "#cccccc" : "#222222",
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
                    {isChoosingFood &&
                        <PubPageInfo
                            pub={data.pub}
                            textColor={theme.textColor}
                            pubColor={pubColorContext}
                            t={t}
                        />
                    }

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
                            <BasketDownPanel pubID={data.pub.url_name} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ThemeWrapperForPubPage;
