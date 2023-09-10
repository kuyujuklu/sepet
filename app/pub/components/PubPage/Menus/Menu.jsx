'use client'
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { PubColorContext, ThemeContext } from "../PubPage";
import { selectMenuID, setMenuID } from "@/app/pub/store/menuSlice";
import { useRouter } from "next/navigation";

const Menu = ({ menu }) => {
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
            router.push(`/pub/${menu?.pub_id}/`)

        dispatch(setMenuID(menu.id));
    };

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Menu name */}
            <div
                onClick={selectMenu}
                className={`border-2 cursor-pointer w-fit py-2 px-4 sm:px-8 rounded-3xl text-sm sm:text-lg font-medium break-words`}
                style={{
                    color: color,
                    borderColor: pubColorContext,
                    background: bgColor,
                    wordBreak: "break-word",
                }}
            >
                {menu.name}
            </div>
        </div>
    );
};

export default Menu;
