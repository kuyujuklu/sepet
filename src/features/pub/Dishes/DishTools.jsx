"use client"
import { useDispatch, useSelector } from "react-redux";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { openDeleteDishPopup, openUpdateDishPopup } from "./dishesSlice";
import { useContext } from "react";
import { useMoveDishLeftMutation, useMoveDishRightMutation } from "@/api/dish/dish";
import { ThemeContext } from "../PubPage";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";

// `showMoveTools` is off in the frontend-only "discounts & hits" category:
// the arrows move a dish within its *real* category, and that category is not
// what is on screen there - the list is ordered by discount size across the
// whole pub, so pressing them would reorder something invisible.
const DishTools = ({menuID, categoryID, dish, showMoveTools = true}) => {
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
            {showMoveTools && (
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
            )}
            {showMoveTools && (
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
            )}
        </div>
    );
}

export default DishTools