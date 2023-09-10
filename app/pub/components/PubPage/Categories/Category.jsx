"use client";
import Link from "next/link";
import Image from "next/image";

const Category = ({ category, pubID }) => {
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
                    <Image
                        src={`/api-static/images/categories/${category.image_file_name}`}
                        alt="category"
                        fill
                        style={{
                            objectFit: "cover",
                        }}
                    />
                )}

                {/* category center content*/}
                <div
                    style={{ zIndex: 20 }}
                    className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col items-center"
                >
                    <div className="p-4 text-2xl font-medium w-fit m-auto">
                        {category.name}
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default Category;
