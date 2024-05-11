"use client"
import { useContext } from "react";
import { ThemeContext } from "../PubPage";
import { useDispatch, useSelector } from "react-redux";
import { openDeleteCategoryPopup, openUpdateCategoryPopup } from "./categorySlice";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { selectMenuID } from "../Menus/menuSlice";
import { useMoveCategoryLeftMutation, useMoveCategoryRightMutation } from "@/api/categories/category";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";

const CategoryTools = ({category}) => {
    const dispatch = useDispatch()
    
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);
    const menuID = useSelector(selectMenuID)

    const [moveTop] = useMoveCategoryLeftMutation({fixedCacheKey: fixedCacheKeys.categories.move_category_left});

    const [moveDown] = useMoveCategoryRightMutation({fixedCacheKey: fixedCacheKeys.categories.move_category_right});

    const themeContext = useContext(ThemeContext);
    
    const handleEditClick = () => {
        dispatch(openUpdateCategoryPopup({companyID, pubID, menuID, categoryID: category.id, initialCategory: category}))
    }

    const handleDeleteClick = () => {
        dispatch(openDeleteCategoryPopup({companyID, pubID, menuID, categoryID: category.id}))
    }

    const handleMoveTopClick = () => {
        moveTop({companyID, pubID, menuID, categoryID: category.id})
    }

    const handleMoveDownClick = () => {
        moveDown({companyID, pubID, menuID, categoryID: category.id})
    }

    return (
        <div
            style={{
                background: themeContext.bgColor,
                color: themeContext.textColor,
            }}
            className="flex flex-col items-center gap-2 p-2 rounded-xl"
        >
            <img
                onClick={handleEditClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/static/admin/images/svg/pencil-white.svg"
                        : "/static/admin/images/svg/pencil-black.svg"
                }
                alt="pencil"
                width={20}
                height={20}
            />
            <img
                onClick={handleDeleteClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/static/admin/images/svg/trash-can-white.svg"
                        : "/static/admin/images/svg/trash-can-black.svg"
                }
                alt="trash-can"
                width={20}
                height={20}
            />
            <img
                onClick={handleMoveTopClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/static/admin/images/svg/arrow-top-white.svg"
                        : "/static/admin/images/svg/arrow-top-black.svg"
                }
                alt="settings"
                width={20}
                height={20}
            />
            <img
                onClick={handleMoveDownClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/static/admin/images/svg/arrow-down-white.svg"
                        : "/static/admin/images/svg/arrow-down-black.svg"
                }
                alt="settings"
                width={20}
                height={20}
            />
        </div>
    );
};

export default CategoryTools;
