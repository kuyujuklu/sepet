"use client";
import { useContext, useEffect } from "react";
import { ThemeContext } from "../PubPage";
import Image from "next/image";
import { selectCompanyID } from "../../company/companySlice";
import { useDispatch, useSelector } from "react-redux";
import { selectMenuID } from "../Menus/menuSlice";
import { selectPubID } from "../pubSlice";
import { useUploadCategoryImageMutation } from "@/app/admin/api/categories/category";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";
import CategoryTools from "./CategoryTools";
import { NavLink } from "react-router-dom";
import { requireAuthentication } from "../../auth/authSlice";
import { useTranslation } from "react-i18next";

const Category = ({ category }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);
    const menuID = useSelector(selectMenuID);

    const [uploadImage, { isLoading, error }] =
        useUploadCategoryImageMutation();

    useEffect(() => {
        if (error && error.text === error.unauthorized) {
            dispatch(requireAuthentication());
        }
    }, [dispatch, error]);

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
                height: "160px",
                width: "100%",
                background: "rgb(17 24 39)",
                color: category.text_color ?? "#ffffff",
                opacity: category.visible ? 1 : 0.5,
            }}
            className="rounded-2xl relative overflow-hidden"
        >
            <NavLink
                style={{ display: "block", height: "160px", width: "100%" }}
                to={`/admin/company/pub/${pubID}/menu/${menuID}/category/${category.id}`}
            >
                {category.image_file_name && (
                    <img
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
            </NavLink>

            {/* category center content*/}
            <div
                style={{ zIndex: 20 }}
                className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col items-center"
            >
                <NavLink
                    to={`/admin/company/pub/${pubID}/menu/${menuID}/category/${category.id}`}
                >
                    <div
                        className="p-4 text-2xl font-medium w-full m-auto cursor-pointer"
                        style={{ textShadow: "0px 0px 3px black" }}
                    >
                        {category.name}
                    </div>
                </NavLink>
                {/* if has no image */}
                {/* uploading image */}
                {isLoading ? (
                    <WhiteSpinner />
                ) : (
                    <label
                        htmlFor={`category-image-input-${category.id}`}
                        className="w-fit flex gap-2 items-center border rounded-3xl py-2 px-4 cursor-pointer"
                        style={{
                            background: themeContext.bgColor,
                            color: themeContext.textColor,
                        }}
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
                        <span>
                            {category.image_file_name
                                ? t("admin.images.update")
                                : t("admin.images.upload")}{" "}
                            {t("admin.images.image")}
                        </span>
                        <input
                            id={`category-image-input-${category.id}`}
                            type="file"
                            onInput={handleFileChange}
                            className="hidden"
                        />
                    </label>
                )}
            </div>

            {/* tools */}
            <div
                style={{ zIndex: 20, color: "#ffffff" }}
                className="absolute top-2 right-2 text-center h-fit w-fit flex flex-col"
            >
                <CategoryTools category={category} />
            </div>
        </div>
    );
};

export default Category;
