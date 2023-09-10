import MenuList from "../PubPage/Menus/MenuList";
import downPanelStyle from "../../sass/custom/down-panel.module.scss";
import React, { useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeContext } from "../PubPage/PubPage";

const MenuDownPanel = ({ pubID, data, reference }) => {
    const themeContext = useContext(ThemeContext);
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
                    <MenuList menus={data.menus} />
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
                            <div className="flex flex-col justify-center items-center">
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
