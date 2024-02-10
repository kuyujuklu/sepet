"use client";
import Image from "next/image";

const SlideButton = ({ onClick, direction }) => {

    return (
        <>
                <div
                    className={`
                  absolute -top-2 sm:bottom-0 sm:my-auto w-fit h-fit cursor-pointer 
                  ${direction === "left" ? "left-4" : "right-2"}`}
                    onClick={onClick}
                    style={{
                        zIndex: 10,
                    }}
                >
                    <div style={{transition: ".3s ease"}} className="p-3 sm:hover:p-4 text-center rounded-full bg-white">
                        <Image
                            style={{
                                transform: `rotate(${
                                    direction === "right" ? 180 : 0
                                }deg)`,
                                position: "relative",
                                right: direction === "right" ? "-2px" : "2px",
                            }}
                            width={30}
                            height={30}
                            src="/images/svg/angle-left-arrow-black.svg"
                            alt="arrow"
                        />
                    </div>
                </div>
        </>
    );
};

export default SlideButton;
