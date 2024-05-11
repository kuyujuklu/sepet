"use client"

import { useEffect } from "react";
import Menu from "./Menu";
import { useDispatch, useSelector } from "react-redux";
import CreateMenuButton from "./CreateMenuButton";
import { useGetMenusQuery } from "@/api/menu/menu";
import { selectCompanyID } from "../../company/companySlice";
import { selectPubID } from "../pubSlice";
import { selectMenuID, setMenuID } from "./menuSlice";
import { errorKeys, setReceivingError } from "../../errorHandlers/errorHandlerSlice";

const MenuList = () => {
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);
    const selectedMenuID = useSelector(selectMenuID);

    const {
        data: menuData,
        error,
    } = useGetMenusQuery({ pubID, companyID });

    useEffect(() => {
        if(!error) return;

        dispatch(setReceivingError({errorKey: errorKeys.get_menus, error}))
    }, [dispatch, error]);

    useEffect(() => {
        if(!menuData?.menus || menuData?.menus?.length === 0) {
            return
        }

        //checing if there is selected menu and it exists
        if(selectedMenuID && menuData.menus.find(menu => menu.id === selectedMenuID)) {
            return
        }

        dispatch(setMenuID(menuData.menus.toSorted((a, b) => a.place - b.place)[0].id))
    }, [dispatch, menuData, selectedMenuID])

    useEffect(() => {
        return () => {
            dispatch(setMenuID(null))
        }
    }, [dispatch])

    return (
        <div className="flex flex-wrap gap-6">
            {menuData?.menus?.toSorted((a, b) => a.place - b.place).map((menu) => (
                <div key={menu.id} className="flex gap-6">
                    <CreateMenuButton place={menu.place} />
                    <Menu key={menu.id} menu={menu} />
                </div>
            ))}
            <CreateMenuButton place={menuData?.menus?.length + 1} />
        </div>
    );
};

export default MenuList;
