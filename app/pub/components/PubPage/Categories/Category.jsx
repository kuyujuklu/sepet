"use client";
import BlackSpinner from "@/app/shared-components/loaders/BlackSpinner";
import Link from "next/link";
import { useEffect, useState } from "react";

const Category = ({ category, pubID }) => {
    const [imageIsLoaded, setImageIsLoaded] = useState(false);
    useEffect(() => {
        setTimeout(() => setImageIsLoaded(true), 5000)
    }, [])
    return (
        <Link
            style={{ display: "block", height: "160px", width: "100%" }}
            href={`/pub/${pubID}/categories/${category.id}`}
        >
            <div
                style={{
                    height: "160px",
                    width: "100%",
                    background: "rgb(17 24 39)",
                    color: category.text_color ?? "#ffffff",
                }}
                className="rounded-2xl relative overflow-hidden"
            >
                {category.image_file_name && (
                    <img
                        onLoad={() => setImageIsLoaded(true)}
                        src={`/api-static/images/categories/${category.image_file_name}`}
                        alt="category"
                        style={{
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                )}

                {/* category center content*/}
                <div
                    style={{ zIndex: 20 }}
                    className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col items-center"
                >
                    <div
                        className="p-4 text-2xl font-medium w-fit m-auto"
                        style={{ textShadow: "0px 0px 3px black" }}
                    >
                        {category.name}
                        {
                            category.image_file_name && !imageIsLoaded && (<div className="w-full h-full flex pt-3 justify-center"><BlackSpinner /></div>)
                        }
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default Category;
