"use client";
import { useDispatch, useSelector } from "react-redux";
import { selectMenuID } from "../Menus/menuSlice";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { useGetCategoriesQuery } from "@/api/categories/category";
import { useContext, useEffect, useMemo } from "react";
import AddCategoryButton from "./AddCategoryButton";
import { ThemeContext } from "../PubPage";
import Category from "./Category";
import PromoCategory from "./PromoCategory";
import {
    errorKeys,
    setReceivingError,
} from "../../errorHandlers/errorHandlerSlice";

const Categories = () => {
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
