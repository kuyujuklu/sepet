"use client"

import { closePopupAreaClickHandler } from "@/app/utils/popupCloseAreaClickHandler";
import Image from "next/image";

const CarouselImageFullscreen = ({
    closeCallback,
    height,
    width,
    src,
    opened,
}) => {
    //this is fucking hell
    const closeClickHandler = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        //this funciton firstly creates an event handler and then calls it with (e) parameter
        closePopupAreaClickHandler(() => {
            closeCallback();
        })(e);
    }

    const viewportWidth = window ? window.innerWidth : 0
    //image width or 90% by viewport width 
    const imageMaxWidth = Math.min(width, viewportWidth * .9)

    return (
        <>
            {opened && (
                <div
                    style={{
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        zIndex: 150
                    }}
                    className="fixed top-0 left-0"
                    onPointerDownCapture={closeClickHandler}
                    onClick={(e) => e.stopPropagation}
                >
                    <div
                        style={{
                            maxHeight: "90vh",
                            maxWidth: imageMaxWidth,
                            aspectRatio: width/height,
                            position: "absolute",
                            margin: "auto",
                        }}
                        className="inset-0 auto"
                    >
                        <Image
                            fill
                            src={src}
                            alt="image"
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default CarouselImageFullscreen;
