"use client"
import { useContext, useEffect } from "react";
import { PubColorContext, ThemeContext } from "../PubPage";
import { useDispatch, useSelector } from "react-redux";
import { openDeleteMenuPopup, openUpdateMenuPopup, selectMenuID, setMenuID } from "./menuSlice";
import Image from "next/image";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { useMoveMenuLeftMutation, useMoveMenuRightMutation } from "@/app/admin/api/menu/menu";
import { requireAuthentication } from "../../auth/authSlice";

const Menu = ({ menu }) => {
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);

    const selectedMenuID = useSelector(selectMenuID);
    const selected = selectedMenuID === menu.id;

    const [moveLeft, {error: moveLeftError}] = useMoveMenuLeftMutation();
    useEffect(() => {
        if (moveLeftError && moveLeftError.text === moveLeftError.unauthorized) {
            dispatch(requireAuthentication())
        }
    }, [dispatch, moveLeftError]);

    const [moveRight, {error: moveRightError}] = useMoveMenuRightMutation();
    useEffect(() => {
        if (moveRightError && moveRightError.text === moveRightError.unauthorized) {
            dispatch(requireAuthentication())
        }
    }, [dispatch, moveRightError]);

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
                    <Image
                        src={
                            themeContext.theme === "dark"
                                ? "/images/svg/pencil-white.svg"
                                : "/images/svg/pencil-black.svg"
                        }
                        alt="settings"
                        width={20}
                        height={20}
                    />
                </div>
                <div className="cursor-pointer" onClick={handleDeleteMenuClick}>
                    <Image
                        src={
                            themeContext.theme === "dark"
                                ? "/images/svg/trash-can-white.svg"
                                : "/images/svg/trash-can-black.svg"
                        }
                        alt="settings"
                        width={20}
                        height={20}
                    />
                </div>
                <div className="cursor-pointer" onClick={moveMenuLeft}>
                    <Image
                        src={
                            themeContext.theme === "dark"
                                ? "/images/svg/arrow-left-white.svg"
                                : "/images/svg/arrow-left-black.svg"
                        }
                        alt="settings"
                        width={20}
                        height={20}
                    />
                </div>
                <div className="cursor-pointer" onClick={moveMenuRight}>
                    <Image
                        src={
                            themeContext.theme === "dark"
                                ? "/images/svg/arrow-right-white.svg"
                                : "/images/svg/arrow-right-black.svg"
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
