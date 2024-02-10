"use client";
import { useEffect } from "react";
import Menu from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import { selectMenuID, setMenuID } from "@/app/pub/store/menuSlice";

const MenuList = ({menus, pubID}) => {
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

    const sortedShownMenus = menus?.toSorted((a, b) => a.place - b.place).filter(menu => menu.visible)
    return (
        <div className={`flex gap-6 justify-left w-full`} style={{overflowY: "auto", overflowX: "auto"}}>
            {sortedShownMenus?.map((menu) => (
                <div key={menu.id} className="flex shrink-0">
                    <Menu key={menu.id} menu={menu} pubID={pubID}/>
                </div>
            ))}
        </div>
    );
};

export default MenuList;
