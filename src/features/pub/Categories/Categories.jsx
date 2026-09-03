"use client";
import { useDispatch, useSelector } from "react-redux";
import { selectMenuID } from "../Menus/menuSlice";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { useGetCategoriesQuery } from "@/api/categories/category";
import { useContext, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AddCategoryButton from "./AddCategoryButton";
import { ThemeContext } from "../PubPage";
import Category from "./Category";
import PromoCategory from "./PromoCategory.jsx";
import {
    errorKeys,
    setReceivingError,
} from "../../errorHandlers/errorHandlerSlice";

const Categories = () => {
    const { t } = useTranslation();
    const themeContext = useContext(ThemeContext);
    const companyID = useSelector(selectCompanyID);
    const menuID = useSelector(selectMenuID);
    const pubID = useSelector(selectPubID);
    const dispatch = useDispatch();

    const { data: categoriesData, error } = useGetCategoriesQuery({
        companyID: companyID,
        menuID: menuID,
        pubID: pubID,
    });
    useEffect(() => {
        if (!error) return;
        dispatch(
            setReceivingError({ errorKey: errorKeys.get_categories, error })
        );
    }, [dispatch, error]);

    const sortedCategories = useMemo(() => {
        if (!categoriesData?.categories) return [];
        const sortedCategories = [...categoriesData?.categories];
        sortedCategories.sort((a, b) => a.place - b.place);
        return sortedCategories;
    }, [categoriesData?.categories]);

    return (
        <div
            style={{
                color: themeContext.textColor,
            }}
        >
            {menuID && <AddCategoryButton />}
            <NavLink
                to={`/admin/pub/${pubID}/edit_menu/modifiers`}
                className="block text-center text-xs sm:text-base font-medium underline mt-3"
                style={{ color: themeContext.textColor }}
            >
                {t("admin.modifier_groups.nav_link")}
            </NavLink>
            <div className="mt-5 flex flex-col gap-4">
                {/* Frontend-only, pinned above every real category and not part
                    of `sortedCategories` - it has no `place` to sort by
                    because it does not exist on the server */}
                <PromoCategory />

                {sortedCategories.map((category) => (
                    <Category key={category.id} category={category} />
                ))}
            </div>
        </div>
    );
};

export default Categories;
