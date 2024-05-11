"use client"
import { useContext } from "react";
import { PubColorContext, ThemeContext } from "../PubPage";
import { useDispatch, useSelector } from "react-redux";
import { openDeleteMenuPopup, openUpdateMenuPopup, selectMenuID, setMenuID } from "./menuSlice";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { useMoveMenuLeftMutation, useMoveMenuRightMutation } from "@/api/menu/menu";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";

const Menu = ({ menu }) => {
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);

    const selectedMenuID = useSelector(selectMenuID);
    const selected = selectedMenuID === menu.id;

    const [moveLeft] = useMoveMenuLeftMutation({fixedCacheKey: fixedCacheKeys.menus.move_menu_left});
    const [moveRight] = useMoveMenuRightMutation({fixedCacheKey: fixedCacheKeys.menus.move_menu_right});

    const themeContext = useContext(ThemeContext);
    const pubColorContext = useContext(PubColorContext);

    let color = pubColorContext;
    let bgColor = themeContext.bgColor;

    if (selected) {
        [color, bgColor] = [bgColor, color];
    }

    const selectMenu = () => {
        dispatch(setMenuID(menu.id));
    };

    const handleEditMenuClick = () => {
        dispatch(openUpdateMenuPopup({ companyID, pubID, menuID: menu.id, initialMenu: menu }));
    };

    const handleDeleteMenuClick = () => {
        dispatch(openDeleteMenuPopup({ companyID, pubID, menuID: menu.id }));
    }

    const moveMenuLeft = () => {
        moveLeft({companyID, pubID, menuID: menu.id});
    }
    const moveMenuRight = () => {
        moveRight({companyID, pubID, menuID: menu.id});
    }

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Menu name */}
            <div
                onClick={selectMenu}
                className={`border-2 cursor-pointer w-fit py-2 px-8 rounded-3xl text-lg font-medium break-words`}
                style={{
                    opacity: menu.visible ? 1 : 0.3,
                    color: color,
                    borderColor: pubColorContext,
                    background: bgColor,
                    wordBreak: "break-word",
                }}
            >
                {menu.name}
            </div>
            {/* Tools */}
            <div className="flex gap-2">
                <div className="cursor-pointer" onClick={handleEditMenuClick}>
                    <img
                        src={
                            themeContext.theme === "dark"
                                ? "/static/admin/images/svg/pencil-white.svg"
                                : "/static/admin/images/svg/pencil-black.svg"
                        }
                        alt="settings"
                        width={20}
                        height={20}
                    />
                </div>
                <div className="cursor-pointer" onClick={handleDeleteMenuClick}>
                    <img
                        src={
                            themeContext.theme === "dark"
                                ? "/static/admin/images/svg/trash-can-white.svg"
                                : "/static/admin/images/svg/trash-can-black.svg"
                        }
                        alt="settings"
                        width={20}
                        height={20}
                    />
                </div>
                <div className="cursor-pointer" onClick={moveMenuLeft}>
                    <img
                        src={
                            themeContext.theme === "dark"
                                ? "/static/admin/images/svg/arrow-left-white.svg"
                                : "/static/admin/images/svg/arrow-left-black.svg"
                        }
                        alt="settings"
                        width={20}
                        height={20}
                    />
                </div>
                <div className="cursor-pointer" onClick={moveMenuRight}>
                    <img
                        src={
                            themeContext.theme === "dark"
                                ? "/static/admin/images/svg/arrow-right-white.svg"
                                : "/static/admin/images/svg/arrow-right-black.svg"
                        }
                        alt="settings"
                        width={20}
                        height={20}
                    />
                </div>
            </div>
        </div>
    );
};

export default Menu;
