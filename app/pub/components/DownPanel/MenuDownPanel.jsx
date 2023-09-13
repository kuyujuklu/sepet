import MenuList from "../PubPage/Menus/MenuList";
import downPanelStyle from "../../sass/custom/down-panel.module.scss";
import React, { useContext  } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeContext } from "../PubPage/PubPage";
import { useSelector } from "react-redux";
import { selectDishes } from "../../store/basketSlice";

const MenuDownPanel = ({ pubID, data, reference }) => {
    const themeContext = useContext(ThemeContext);
    const selectedDishes = useSelector(selectDishes);
    const count = Object.keys(selectedDishes).reduce(
        (acc, id) => (acc += selectedDishes[id]),
        0
    );


    return (
        <div
            className={downPanelStyle.wrapper}
            ref={reference}
            style={{
                color: themeContext.textColor,
                background: "transparent",
            }}
        >
            <div className={`${downPanelStyle.content} w-full`}>
                <div
                    className="flex flex-col gap-2"
                    style={{ minWidth: 320, width: "100%" }}
                >
                    <div className="relative ">
                        <div className="relative ">
                            <MenuList menus={data.menus} />
                        </div>
                    </div>
                    <div
                        className="flex justify-evenly items-center w-full p-2"
                        style={{
                            background: themeContext.bgColor,
                        }}
                    >
                        <Link href={`/pub/${pubID}/`}>
                            <div className="flex flex-col justify-center items-center">
                                <Image
                                    className="cursor-pointer"
                                    src={
                                        themeContext.theme === "dark"
                                            ? "/images/svg/spoon-and-fork-white.svg"
                                            : "/images/svg/spoon-and-fork-black.svg"
                                    }
                                    alt="pencil"
                                    width={35}
                                    height={35}
                                />
                                <span className="text-2xs">Menu</span>
                            </div>
                        </Link>
                        <Link href={`/pub/${pubID}/basket`}>
                            <div className="relative flex flex-col justify-center items-center">
                                <Image
                                    className="cursor-pointer"
                                    src={
                                        themeContext.theme === "dark"
                                            ? "/images/svg/basket-white.svg"
                                            : "/images/svg/basket-black.svg"
                                    }
                                    alt="pencil"
                                    width={30}
                                    height={35}
                                />
                                {count > 0 && (
                                    <div
                                        className="absolute bg-red-600 rounded-full aspect-square text-3xs px-1 flex items-center"
                                        style={{
                                            top: -5,
                                            right: -5,
                                        }}
                                        width={20}
                                        height={20}
                                    >
                                        {count}
                                    </div>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.forwardRef((props, ref) => (
    <MenuDownPanel {...props} reference={ref} />
));
