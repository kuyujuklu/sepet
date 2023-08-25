import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../PubPage";
import Image from "next/image";
import { selectCompanyID } from "../../company/companySlice";
import { useSelector } from "react-redux";
import { selectMenuID } from "../Menus/menuSlice";
import { selectPubID } from "../pubSlice";
import { useUploadCategoryImageMutation } from "@/app/admin/api/categories/category";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";

const Category = ({ category }) => {
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);
    const menuID = useSelector(selectMenuID);

    const [uploadImage, {isLoading, error }] = useUploadCategoryImageMutation();
    useEffect(() => {
        if (error) {
            //TODO: handle error
        }
    }, [error]);

    const themeContext = useContext(ThemeContext);

    const handleFileChange = (e) => {
        if (!e.target.files || e.target.files.length < 1) {
            return;
        }

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("image", file);
        uploadImage({
            companyID: companyID,
            pubID: pubID,
            menuID: menuID,
            categoryID: category.id,
            data: formData,
        });
    };

    return (
        <div
            style={{
                minHeight: "160px",
                width: "100%",
                border: "1px solid " + themeContext.textColor,
                backgroundColor: category.image_file_name ? "transparent" : "rgb(17 24 39)",
            }}
            className="rounded-2xl relative overflow-hidden"
        >
            {category.image_file_name && (
                <Image
                    src={`/api-static/images/categories/${category.image_file_name}`}
                    alt="category"
                    fill
                    style={{
                        objectFit:"cover",
                    }}
                />
            )}

            <div
                style={{ zIndex: 20, color: "#ffffff" }}
                className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col"
            >
                <div className="text-3xl font-medium">{category.name}</div>
                {/* if has no image */}
                {!category.image_file_name &&
                    <>
                    {
                        isLoading ? (
                            WhiteSpinner
                        ) : (
                            <label
                                htmlFor="category-image-input"
                                className="flex gap-2 items-center border rounded-3xl py-2 px-4 cursor-pointer"
                            >
                                <Image
                                    src={
                                        themeContext.theme === "dark"
                                            ? "/images/svg/plus-white.svg"
                                            : "/images/svg/plus-black.svg"
                                    }
                                    alt="plus"
                                    width={17}
                                    height={17}
                                />
                                <span>Загрузить фото</span>
                                <input
                                    id="category-image-input"
                                    type="file"
                                    onInput={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        )
                    }
                    </>
                }
            </div>
        </div>
    );
};

export default Category;
