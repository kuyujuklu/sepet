"use client";

import { useEffect, useState } from "react";
import CarouselImage from "./CarouselImage";
import SlideButton from "./SlideButton";

const ImageWidth = 230;
const ImagesGap = 16;

const imageSources = [
    {
        height: 837,
        width: 487,
        src: "/images/png/screen3.png",
        description: "Различные блюда",
    },
    {
        height: 837,
        width: 487,
        src: "/images/png/screen1.png",
        description: "Разновидности одного блюда",
    },
    {
        height: 837,
        width: 487,
        src: "/images/png/screen2.png",
        description: "Напитки",
    },
    {
        height: 837,
        width: 487,
        src: "/images/png/basket.png",
        description: "Удобная корзина",
    },
    {
        height: 837,
        width: 487,
        src: "/images/png/screen4.png",
        description: "Все под рукой",
    },
    {
        height: 837,
        width: 487,
        src: "/images/png/full-customization.png",
        description: "Полная кастомизация",
    },
    {
        height: 837,
        width: 487,
        src: "/images/png/screen5.png",
        description: "Интуитивно понятный интерфейс",
    },
];
const initialCarouselImagesLength = imageSources.length;

const Carousel = () => {
    const [carouselImages, setCarouselImages] = useState(
        imageSources.map((block, index) => (
            <CarouselImage
                src={block.src}
                description={block.description}
                minWidth={ImageWidth}
                width={block.width}
                height={block.height}
                key={index}
            />
        ))
    );

    const [maxRightClicks, setMaxRightClicks] = useState(0);
    const [rightClicks, setRightClicks] = useState(0);

    useEffect(() => {
        if (rightClicks > maxRightClicks) {
            setMaxRightClicks(rightClicks);

            let newImageIndex = carouselImages.length;
            let newImageBlock =
                imageSources[newImageIndex % initialCarouselImagesLength];
            setCarouselImages((prev) => [
                ...prev,
                <CarouselImage
                    description={newImageBlock.description}
                    src={newImageBlock.src}
                    minWidth={ImageWidth}
                    width={newImageBlock.width}
                    height={newImageBlock.height}
                    key={newImageIndex}
                />,
            ]);
        }
        console.log("push");
    }, [maxRightClicks, rightClicks, carouselImages]);

    return (
        <div
            style={{
                overflow: "hidden",
                position: "relative",
                maxWidth: 1280,
                width: "100vw",
            }}
        >
            <h1 className="text-xl sm:text-2xl text-center text-gray-800 font-bold">
                Галерея
            </h1>
            <div
                className="flex relative sm:pb-0 my-8 mx-4"
                style={{
                    gap: `${ImagesGap}px`,
                    transition: "left 0.5s ease-in-out",
                    position: "relative",
                    left: `-${(ImageWidth + ImagesGap) * rightClicks}px`,
                }}
            >
                {carouselImages}
            </div>
            {rightClicks > 0 && (
                <SlideButton
                    direction="left"
                    onClick={() => setRightClicks((prev) => prev - 1)}
                />
            )}
            <SlideButton
                direction="right"
                onClick={() => setRightClicks((prev) => prev + 1)}
            />
        </div>
    );
};

export default Carousel;
