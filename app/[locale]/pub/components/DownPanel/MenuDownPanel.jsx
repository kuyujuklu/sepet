import MenuList from "../PubPage/Menus/MenuList";
import downPanelStyle from "../../sass/custom/down-panel.module.scss";
import React, { useContext  } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeContext } from "../PubPage/ThemeContextProvider";
import BasketCount from "./BasketCount";
import SwitchLang from "./SwitchLang";
import { useSelector } from "react-redux";
import { selectDishes } from "../../store/basketSlice";
import { useTranslation } from "react-i18next";

const MenuDownPanel = ({ pubID, data }) => {
    const themeContext = useContext(ThemeContext);

    const selectedDishes = useSelector(selectDishes);
    const count = Object.keys(selectedDishes)
        .reduce((acc, id) => (acc += selectedDishes[id].count ?? 0), 0);

    const {i18n} = useTranslation()

    return (
        <div
            className={downPanelStyle.wrapper}
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
                    <div className="relative">
                        <div className="relative">
                            <MenuList menus={data.menus} pubID={pubID}/>
                        </div>
                    </div>

                    <div
                        className="flex justify-evenly items-center w-full p-2"
                        style={{
                            background: themeContext.bgColor,
                        }}
                    >
                        <Link href={`/${i18n.language}/pub/${pubID}/`}>
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
                        <Link href={`/${i18n.language}/pub/${pubID}/basket`}>
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
                                <BasketCount count={count} />
                            </div>
                        </Link>
                        {/* <div className="flex flex-col justify-center items-center">
                            <SwitchLang />
                        </div> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.forwardRef((props, ref) => (
    <MenuDownPanel {...props} reference={ref} />
));
