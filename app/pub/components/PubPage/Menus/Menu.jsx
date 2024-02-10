'use client'
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PubColorContext, ThemeContext } from "../PubPage";
import { selectMenuID, setMenuID } from "@/app/pub/store/menuSlice";
import { useRouter } from "next/navigation";

const Menu = ({ menu, pubID }) => {
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
            router.push(`/pub/${pubID}/`)

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
