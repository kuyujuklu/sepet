'use client'
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PubColorContext, ThemeContext } from "../ThemeContextProvider";
import { selectMenuID, setMenuID } from "@/app/[locale]/pub/store/menuSlice";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const Menu = ({ menu, pubID }) => {
    const {i18n} = useTranslation()
    const router = useRouter()
    const dispatch = useDispatch();
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
        if (selected)
            router.push(`/${i18n.language}/pub/${pubID}/`)

        dispatch(setMenuID(menu.id));
    };

    return (
        <div className="w-full">
            {/* Menu name */}
            <button
                onClick={selectMenu}
                className={`border-2 cursor-pointer w-full py-2 px-4 sm:px-8 rounded-3xl text-sm sm:text-lg font-medium break-words`}
                style={{
                    color: color,
                    borderColor: pubColorContext,
                    background: bgColor,
                    wordBreak: "break-word",
                }}
            >
                {menu.name}
            </button>
        </div>
    );
};

export default Menu;
