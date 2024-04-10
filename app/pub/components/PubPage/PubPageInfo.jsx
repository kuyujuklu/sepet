"use client";

import { useContext } from "react";
import { PubColorContext, ThemeContext } from "./PubPage";
import { useTranslation } from "react-i18next";

const PubPageInfo = ({ pub }) => {
    const themeContext = useContext(ThemeContext);
    const pubColorContext = useContext(PubColorContext);
    const {t} = useTranslation()

    return (
        <div style={{ color: pubColorContext }}>
            <header>
                <h1 className="text-3xl font-bold mb-4" style={{color: themeContext.textColor}}>{pub.name}</h1>
            </header>
            <div className="flex items-center gap-y-2 justify-between flex-wrap text-sm sm:text-base">
                {
                    pub.wifi_password &&
                    <div style={{ width: "100%", maxWidth: 300}} className="flex gap-2">
                        <span>{t("client.pub_info.wifi_password")}: </span>
                        <span>{pub.wifi_password}</span>
                    </div>
                }
                {
                    pub.address && 
                    <div style={{ width: "100%", maxWidth: 300}} className="flex items-center gap-2">
                        <span>{t("client.pub_info.address")}: </span>
                        <span>{pub.address}</span>
                    </div>
                }
                {
                    pub.additional_info && 
                    <div style={{ width: "100%" }} className="flex flex-wrap gap-x-2 mt-2">
                        <span>{t("client.pub_info.additional_info")}: </span>
                        <span>{pub.additional_info}</span>
                    </div>
                }
            </div>
        </div>
    );
};

export default PubPageInfo;
