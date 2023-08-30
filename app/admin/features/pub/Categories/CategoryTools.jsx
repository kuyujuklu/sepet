import Image from "next/image";
import { useContext, useEffect } from "react";
import { ThemeContext } from "../PubPage";
import { useDispatch, useSelector } from "react-redux";
import { openDeleteCategoryPopup, openUpdateCategoryPopup } from "./categorySlice";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { selectMenuID } from "../Menus/menuSlice";
import { useMoveCategoryLeftMutation, useMoveCategoryRightMutation } from "@/app/admin/api/categories/category";
import { requireAuthentication } from "../../auth/authSlice";

const CategoryTools = ({category}) => {
    const dispatch = useDispatch()
    
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);
    const menuID = useSelector(selectMenuID)

    const [moveTop, { error: moveTopError }] = useMoveCategoryLeftMutation();
    useEffect(() => {
        if (moveTopError && moveTopError.text === moveTopError.unauthorized) {
            dispatch(requireAuthentication())
        }
    }, [dispatch, moveTopError]);


    const [moveDown, { error: moveDownError }] = useMoveCategoryRightMutation();
    useEffect(() => {
        if (moveDownError && moveDownError.text === moveDownError.unauthorized) {
            dispatch(requireAuthentication())
        }
    }, [dispatch, moveDownError]);

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
            <Image
                onClick={handleEditClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/images/svg/pencil-white.svg"
                        : "/images/svg/pencil-black.svg"
                }
                alt="pencil"
                width={20}
                height={20}
            />
            <Image
                onClick={handleDeleteClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/images/svg/trash-can-white.svg"
                        : "/images/svg/trash-can-black.svg"
                }
                alt="trash-can"
                width={20}
                height={20}
            />
            <Image
                onClick={handleMoveTopClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/images/svg/arrow-top-white.svg"
                        : "/images/svg/arrow-top-black.svg"
                }
                alt="settings"
                width={20}
                height={20}
            />
            <Image
                onClick={handleMoveDownClick}
                className="cursor-pointer"
                src={
                    themeContext.theme === "dark"
                        ? "/images/svg/arrow-down-white.svg"
                        : "/images/svg/arrow-down-black.svg"
                }
                alt="settings"
                width={20}
                height={20}
            />
        </div>
    );
};

export default CategoryTools;
