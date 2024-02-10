"use client";
import Image from "next/image";
import CarouselImageFullscreen from "./CarouselImageFullscreen";
import { useState } from "react";
import NoSSR from "react-no-ssr";

const CarouselImage = ({ description, minWidth, width, height, src }) => {
    const [opened, setOpened] = useState(false);

    const openFullScreen = (e) => {
        e.preventDefault();
        e.stopPropagation();

        console.log("target: ", e.target, "current target: ", e.currentTarget)

        if(e.target !== e.currentTarget) return

        setOpened(true);
    }

    return (
        <>
            <NoSSR onSSR={<></>}>
                <CarouselImageFullscreen
                    closeCallback={() => setOpened(false)}
                    width={width}
                    height={height}
                    src={src}
                    opened={opened}
                />
            </NoSSR>
            <div className="flex flex-col gap-4">
                <div
                    style={{
                        height: "300px",
                        minWidth: minWidth,
                    }}
                    className="rounded-xl shadow-lg shadow-gray-400 relative cursor-pointer"
                >
                    <Image
                        onPointerUp={openFullScreen}
                        className="rounded-xl"
                        fill
                        style={{ objectFit: "cover" }}
                        src={src}
                        alt="qrmenu image"
                    />
                </div>
                {/* description */}
                <div className="text-lg ml-3">{description}</div>
            </div>
        </>
    );
};

export default CarouselImage;
