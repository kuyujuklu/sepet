"use client";

import { useContext } from "react";
import { ThemeContext } from "./ThemeContextProvider";
import PubPageInfo from "./PubPageInfo";
import PubPageUpper from "./PubPageUpper";
import FloatingCartButton from "../Basket/FloatingCartButton";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const ThemeWrapperForPubPage = ({ data, children }) => {
    const {t, i18n} = useTranslation();
    const theme = useContext(ThemeContext);
    const pathname = usePathname();

    const isChoosingFood = !pathname.includes("basket");
    // `data` here is the raw SSR payload (see layout.js's getPubInfo), not
    // the redux-normalized state - `pub.id` on it is still the numeric DB
    // id, not the url_name slug the /pub/[pubID] route actually expects.
    // `url_name` is the one field that's correct in both shapes, so routing
    // must use it, not `.id` - using `.id` here sent both the back button
    // and the floating cart to a route that 404s (e.g. /pub/39 instead of
    // /pub/lucca).
    const backHref = isChoosingFood ? "/" : `/${i18n.language}/pub/${data.pub.url_name}`;

    return (
        <div
            style={{
                fontFamily: "Rubik, sans-serif",
                minHeight: "100vh",
                background: theme.theme === "light" ? "#eef1f4" : "#0d1117",
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
                    position: "relative",
                }}
                className={"relative rounded-3xl"}
            >
                <PubPageUpper pub={data.pub} backHref={backHref} />
                <div
                    style={{
                        fontFamily: "Rubik, sans",
                        display: "block",
                        position: "relative",
                        top: "160px",
                        padding: "20px",
                        zIndex: 10,
                        background: theme.bgColor,
                        paddingBottom: "60px",
                    }}
                    className="rounded-2xl p-5"
                >
                    {isChoosingFood &&
                        <PubPageInfo pub={data.pub} t={t} />
                    }

                    {children}
                </div>

                {isChoosingFood && <FloatingCartButton pubID={data.pub.url_name} />}
            </div>
        </div>
    );
};

export default ThemeWrapperForPubPage;
