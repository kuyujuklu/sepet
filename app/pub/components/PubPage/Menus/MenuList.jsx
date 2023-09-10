"use client";
import { useEffect } from "react";
import Menu from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import { selectMenuID, setMenuID } from "@/app/pub/store/menuSlice";

const MenuList = ({menus}) => {
    const dispatch = useDispatch()
    const menuID = useSelector(selectMenuID)
    useEffect(() => {
        if(!menuID) {
            const sortedShownMenus = menus?.toSorted((a, b) => a.place - b.place).filter(menu => menu.visible)
            if(sortedShownMenus.length > 0) {
                dispatch(setMenuID(sortedShownMenus[0].id))
            }
        }
    }, [dispatch, menuID, menus])

    const sortedShownMenus = menus.filter(menu => menu.visible)
    return (
        <div className="flex flex-wrap gap-6 justify-center">
            {sortedShownMenus?.map((menu) => (
                <div key={menu.id} className="flex gap-4">
                    <Menu key={menu.id} menu={menu} />
                </div>
            ))}
        </div>
    );
};

export default MenuList;
