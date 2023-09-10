import downPanelStyle from "../../sass/custom/down-panel.module.scss";
import React, { useContext } from "react";
import { ThemeContext } from "../PubPage/PubPage";
import Image from "next/image";
import Link from "next/link";

const DownPanel = ({ reference, pubID }) => {
    const themeContext = useContext(ThemeContext);

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
                    className="flex flex-col gap-2 py-2"
                    style={{ minWidth: 320, width: "100%" }}
                >
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
                                    width={30}
                                    height={30}
                                />
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
                                    width={35}
                                    height={35}
                                />
                                <span className="text-2xs">Basket</span>
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
