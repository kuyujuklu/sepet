"use client"
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { openDeleteDishPopup, openUpdateDishPopup } from "./dishesSlice";
import { useContext } from "react";
import { useMoveDishLeftMutation, useMoveDishRightMutation } from "@/app/admin/api/dish/dish";
import { ThemeContext } from "../PubPage";
import { fixedCacheKeys } from "@/app/admin/api/fixedCacheKeys";

const DishTools = ({menuID, categoryID, dish}) => {
    const dispatch = useDispatch()
    
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);

    const [moveTop] = useMoveDishLeftMutation({fixedCacheKey: fixedCacheKeys.dishes.move_dish_left});
    const [moveDown] = useMoveDishRightMutation({fixedCacheKey: fixedCacheKeys.dishes.move_dish_right});

    const themeContext = useContext(ThemeContext);
    
    const handleEditClick = () => {
        dispatch(openUpdateDishPopup({companyID, pubID, menuID, categoryID, dishID: dish.id, initialDish: dish, place: dish.place}))
    }

    const handleDeleteClick = () => {
        dispatch(openDeleteDishPopup({companyID, pubID, menuID, categoryID, dishID: dish.id}))
    }

    const handleMoveTopClick = () => {
        moveTop({companyID, pubID, menuID, categoryID, dishID: dish.id})
    }

    const handleMoveDownClick = () => {
        moveDown({companyID, pubID, menuID, categoryID, dishID: dish.id})
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
}

export default DishTools