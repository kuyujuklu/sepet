import downPanelStyle from "../../sass/custom/down-panel.module.scss";
import React, { useContext } from "react";
import { ThemeContext } from "../PubPage/PubPage";
import Image from "next/image";
import Link from "next/link";
import { useSelector } from "react-redux";
import { selectDishes } from "../../store/basketSlice";

const DownPanel = ({ reference, pubID }) => {
    const themeContext = useContext(ThemeContext);

    const selectedDishes = useSelector(selectDishes);
    const count = Object.keys(selectedDishes).reduce((acc, id) => acc += selectedDishes[id], 0);
    return (
        <div
            className={downPanelStyle.wrapper}
            ref={reference}
            style={{
                color: themeContext.textColor,
            }}
        >
            <div className={downPanelStyle.content}>
                <div
                    className="flex flex-col gap-2 pt-4"
                    style={{ minWidth: 320, width: "100%" }}
                >
                    <div
                        className="flex justify-evenly items-center w-full"
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
                                    width={30}
                                    height={30}
                                />
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
                                    width={35}
                                    height={35}
                                />
                                <span className="text-2xs">Basket</span>
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
    <DownPanel {...props} reference={ref} />
));
