import { useContext } from "react";
import { PubColorContext, ThemeContext } from "../PubPage";
import { useDispatch, useSelector } from "react-redux";
import { openDeleteMenuPopup, openUpdateMenuPopup, selectMenuID, setMenuID } from "./menuSlice";
import Image from "next/image";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";

const Menu = ({ menu }) => {
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);

    const selectedMenuID = useSelector(selectMenuID);
    const selected = selectedMenuID === menu.id;

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

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Menu name */}
            <div
                onClick={selectMenu}
                className={`border-2 cursor-pointer w-fit py-2 px-8 rounded-3xl text-lg font-medium break-words`}
                style={{
                    color: color,
                    borderColor: pubColorContext,
                    backgroundColor: bgColor,
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
                <div className="cursor-pointer">
                    <Image
                        src={
                            themeContext.theme === "dark"
                                ? "/images/svg/settings-white.svg"
                                : "/images/svg/settings-black.svg"
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
