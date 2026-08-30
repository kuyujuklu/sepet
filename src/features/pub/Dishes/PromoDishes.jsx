"use client";
import { useContext, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ThemeContext } from "../PubPage";
import { selectPubID } from "../pubSlice";
import Dish from "./Dish";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { usePromoDishes } from "../Categories/usePromoDishes";
import {
    matchesPromoFilter,
    promoFilters,
} from "../Categories/promoCategory";

// The listing behind the frontend-only "discounts & hits" category.
//
// Every dish of the pub that is discounted or marked a hit, biggest discount
// first, whichever menu and category it actually lives in. Each row carries
// that origin as a breadcrumb, and the dish card itself is the ordinary one -
// which is the point: the pencil opens the same UpdateDishPopup and writes to
// the dish's real category, so a discount can be changed here instead of
// hunting for the dish in the menu tree.
const PromoDishes = () => {
    const { t } = useTranslation();
    const themeContext = useContext(ThemeContext);
    const pubID = useSelector(selectPubID);

    const [filter, setFilter] = useState(promoFilters.all);

    const { promoDishes, discountsCount, hitsCount, isLoading } = usePromoDishes();

    const shownDishes = useMemo(
        () => promoDishes.filter((entry) => matchesPromoFilter(entry.dish, filter)),
        [promoDishes, filter]
    );

    const filterOptions = [
        {
            value: promoFilters.all,
            label: t("admin.categories.promo.filters.all"),
            count: promoDishes.length,
        },
        {
            value: promoFilters.discounts,
            label: t("admin.categories.promo.filters.discounts"),
            count: discountsCount,
        },
        {
            value: promoFilters.hits,
            label: t("admin.categories.promo.filters.hits"),
            count: hitsCount,
        },
    ];

    return (
        <div>
            <div className="mb-4 flex items-center flex-wrap-reverse gap-6">
                <div style={{ color: themeContext.textColor }} className="text-2xl">
                    {t("admin.categories.promo.title")}
                </div>
                <NavLink
                    style={{ color: themeContext.textColor }}
                    className={"rounded-xl text-center h-fit w-fit p-2 bg-red-600"}
                    to={`/admin/pub/${pubID}/edit_menu`}
                >
                    {t("admin.dishes.upper.return_back")}
                </NavLink>
            </div>

            {/* Why the list spans menus this dish's own category page does not */}
            <div
                style={{ color: themeContext.textColor }}
                className="mb-4 text-sm opacity-70"
            >
                {t("admin.categories.promo.explainer")}
            </div>

            <div className="mb-6 flex gap-2 flex-wrap">
                {filterOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setFilter(option.value)}
                        style={
                            filter === option.value
                                ? { background: "rgb(217 119 6)", color: "#ffffff" }
                                : {
                                      background: "transparent",
                                      color: themeContext.textColor,
                                      border: "1px solid " + themeContext.textColor,
                                  }
                        }
                        className="rounded-3xl py-2 px-4 text-sm cursor-pointer"
                    >
                        {option.label} ({option.count})
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="flex justify-center py-10">
                    <BlackSpinner />
                </div>
            )}

            {!isLoading && shownDishes.length === 0 && (
                <div
                    style={{ color: themeContext.textColor }}
                    className="py-10 text-center opacity-70"
                >
                    {t("admin.categories.promo.empty")}
                </div>
            )}

            <div className="flex flex-col gap-4">
                {shownDishes.map((entry) => (
                    <div key={`${entry.categoryID}-${entry.dish.id}`}>
                        {/* Where the dish really lives - without it the wider
                            scope reads as a bug rather than a feature */}
                        <div
                            style={{ color: themeContext.textColor }}
                            className="mb-1 text-sm opacity-70 flex gap-2 items-center flex-wrap"
                        >
                            <span>
                                {entry.menuName} › {entry.categoryName}
                            </span>
                            {entry.discountPercent > 0 && (
                                <span className="rounded-full bg-red-600 text-white text-xs py-0.5 px-2">
                                    -{entry.discountPercent}%
                                </span>
                            )}
                        </div>

                        <Dish
                            dish={entry.dish}
                            menuID={entry.menuID}
                            categoryID={entry.categoryID}
                            // The arrows reorder within the real category,
                            // which is not the order shown here
                            showMoveTools={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromoDishes;
