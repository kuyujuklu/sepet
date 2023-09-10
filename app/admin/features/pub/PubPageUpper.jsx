"use client"
import Image from "next/image";
import { ThemeContext } from "./PubPage";
import { useContext, useEffect } from "react";
import { useUploadPubBGMutation } from "../../api/pub/pub";
import { useDispatch } from "react-redux";
import { requireAuthentication } from "../auth/authSlice";
import { useTranslation } from "react-i18next";

const PubPageUpper = ({ imageFileName, companyID, pubID }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [uploadImage, { error }] = useUploadPubBGMutation();
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
        formData.append("bg", file);
        uploadImage({
            companyID: companyID,
            pubID: pubID,
            data: formData,
        });
    };

    return (
        <div
            style={{
                height: "180px",
                width: "100%",
                position: "absolute",
                overflow: "hidden",
            }}
            className="rounded-t-3xl"
            background={themeContext.bgColor}
        >
            {imageFileName && (
                <Image
                    src={`/api-static/images/pubs/bgs/${imageFileName}`}
                    alt="pub-cover"
                    fill
                    style={{
                        objectFit: "cover",
                    }}
                />
            )}
            <div
                style={{ zIndex: 20 }}
                className="absolute top-14 left-0 right-0 mx-auto text-center w-fit h-fit"
            >
                <label
                    htmlFor={`pub-image`}
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
                        {imageFileName
                            ? t("admin.images.update")
                            : t("admin.images.upload")}{" "}
                        {t("admin.images.image")}
                    </span>
                    <input
                        id={`pub-image`}
                        type="file"
                        onInput={handleFileChange}
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};

export default PubPageUpper;
