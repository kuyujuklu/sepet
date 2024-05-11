"use client";
import { useDispatch, useSelector } from "react-redux";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { useUploadDishImageMutation } from "@/api/dish/dish";
import { useContext, useEffect } from "react";
import { ThemeContext } from "../PubPage";
import WhiteSpinner from "@/components/loaders/WhiteSpinner";
import DishTools from "./DishTools";
import { currencies } from "@/static-data/data";
import { useGetPubQuery } from "@/api/pub/pub";
import { requireAuthentication } from "../../auth/authSlice";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";

const Dish = ({ dish, menuID, categoryID }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);

    const { data: pubData, error: pubError } = useGetPubQuery({
        companyID,
        pubID,
    });
    useEffect(() => {
        if (pubError && pubError.text === pubError.unauthorized) {
            dispatch(requireAuthentication());
        }
    }, [dispatch, pubError]);

    const [uploadImage, { isLoading }] = useUploadDishImageMutation({
        fixedCacheKey: fixedCacheKeys.dishes.upload_dish_image,
    });

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
            categoryID: categoryID,
            dishID: dish.id,
            data: formData,
        });
    };



    const currency = currencies.find(
        (currency) => currency.id === pubData?.pub?.currency_id
    )?.symbol ?? "Lei"

    return (
        <div>
            {/* dish innter */}
            <div
                style={{
                    height: "160px",
                    width: "100%",
                    border: "1px solid " + themeContext.textColor,
                    background: "rgb(17 24 39)",
                    color: dish.text_color ?? "#ffffff",
                    opacity: dish.visible ? 1 : 0.5,
                }}
                className="rounded-2xl relative overflow-hidden"
            >
                {dish.image_file_name && (
                    <img
                        src={`/api-static/images/dishes/${dish.image_file_name}`}
                        alt="dish"
                        style={{
                            position: "absolute",
                            display: "block",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                )}

                {/* dish center content*/}
                <div
                    style={{ zIndex: 20 }}
                    className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col items-center"
                >
                    <div
                        className="p-4 text-xl font-medium"
                        style={{ textShadow: "0px 0px 3px black" }}
                    >
                        {dish.name}
                    </div>
                    {isLoading ? (
                        <WhiteSpinner />
                    ) : (
                        <label
                            htmlFor={`dish-image-input-${dish.id}`}
                            className="w-fit flex gap-2 items-center border rounded-3xl py-2 px-4 cursor-pointer"
                            style={{
                                background: themeContext.bgColor,
                                color: themeContext.textColor,
                            }}
                        >
                            <img
                                src={
                                    themeContext.theme === "dark"
                                        ? "/static/admin/images/svg/plus-white.svg"
                                        : "/static/admin/images/svg/plus-black.svg"
                                }
                                alt="plus"
                                width={17}
                                height={17}
                            />
                            <span>
                                {dish.image_file_name
                                    ? t("admin.images.update")
                                    : t("admin.images.upload")}{" "}
                                {t("admin.images.image")}
                            </span>
                            <input
                                id={`dish-image-input-${dish.id}`}
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
                    <DishTools
                        menuID={menuID}
                        categoryID={categoryID}
                        dish={dish}
                    />
                </div>
            </div>
            {/* dish price */}
            <div className="flex flex-col justify-between px-4 py-2">
                <div>
                    <span className="text-gray-600 text-xl">
                        {dish.ingredients}
                    </span>
                </div>
                <div
                    style={{ color: themeContext.textColor }}
                    className="text-xl font-medium"
                >
                    {
                        <>
                            {dish.sale_price ? (
                                <span>
                                    <strike className="mr-3 text-red-500">{dish.price} {currency}</strike>
                                    <span className="">
                                        {dish.sale_price}
                                    </span>
                                </span>
                            ) : (
                                <span>{dish.price}</span>
                            )}
                        </>
                    }{" "}
                    <span>
                        {currency}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Dish;
