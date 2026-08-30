"use client";
import { useContext } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../PubPage";
import { selectPubID } from "../pubSlice";
import { getPromoCategoryPath } from "./promoCategory";
import { usePromoDishes } from "./usePromoDishes";

// The frontend-only category, pinned above every real one.
//
// Same shape and height as Category so the list reads as one column, but
// deliberately not the same skin: no photo, no image-upload button and no
// CategoryTools, because there is nothing on the server to rename, reorder or
// delete. The amber gradient is what says "this one is not like the others".
const PromoCategory = () => {
    const { t } = useTranslation();
    const themeContext = useContext(ThemeContext);
    const pubID = useSelector(selectPubID);

    const { promoDishes, discountsCount, hitsCount, isLoading } = usePromoDishes();

    // Nothing is on offer and nothing is marked a hit: an empty card would be
    // a permanent dead end on top of the list
    if (!isLoading && promoDishes.length === 0) return null;

    return (
        <NavLink
            to={getPromoCategoryPath(pubID)}
            style={{
                height: "160px",
                width: "100%",
                background:
                    "linear-gradient(135deg, rgb(180 83 9) 0%, rgb(217 119 6) 55%, rgb(245 158 11) 100%)",
                color: "#ffffff",
            }}
            className="rounded-2xl relative overflow-hidden block"
        >
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <div
                    className="text-2xl font-medium"
                    style={{ textShadow: "0px 0px 3px black" }}
                >
                    {t("admin.categories.promo.title")}
                </div>

                <div className="mt-1 text-sm opacity-90">
                    {t("admin.categories.promo.subtitle")}
                </div>

                <div className="mt-3 flex gap-2 flex-wrap justify-center">
                    <span className="rounded-full bg-black/35 text-xs py-1 px-3">
                        {t("admin.categories.promo.discounts_count", {
                            count: discountsCount,
                        })}
                    </span>
                    <span className="rounded-full bg-black/35 text-xs py-1 px-3">
                        {t("admin.categories.promo.hits_count", {
                            count: hitsCount,
                        })}
                    </span>
                </div>
            </div>

            {/* Says out loud that this category is not on the server, so nobody
                goes looking for it in the pub's real menu */}
            <div
                style={{ background: themeContext.bgColor, color: themeContext.textColor }}
                className="absolute top-2 right-2 rounded-full text-xs py-1 px-3"
            >
                {t("admin.categories.promo.virtual_badge")}
            </div>
        </NavLink>
    );
};

export default PromoCategory;
