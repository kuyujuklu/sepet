"use client";
import { useEffect, useMemo } from "react";
import Menu from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import { selectMenuID, setMenuID } from "@/app/[locale]/pub/store/menuSlice";

const MenuList = ({menus, pubID}) => {
    const dispatch = useDispatch()
    const menuID = useSelector(selectMenuID)

    const sortedShownMenus = useMemo(() => {
        if(!menus) return []

        const sortedMenus = [...menus];        
        sortedMenus.sort((a, b) => a.place - b.place)
        return sortedMenus.filter(menu => menu.visible)
    }, [menus])

    useEffect(() => {
        if(!menuID) {
            if(sortedShownMenus.length > 0) {
                dispatch(setMenuID(sortedShownMenus[0].id))
            }
        }
    }, [dispatch, menuID, sortedShownMenus])

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
