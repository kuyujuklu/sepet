"use client";
import { Button } from "@mui/material";
import Image from "next/image";
import {
    openDeletePubPopup,
    openQrCodePopup,
    openUpdatePubPopup,
} from "../pub/pubSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ConvertQrMenuApiTimeToLocal } from "@/app/utils/time";

const CompanyPub = ({ pub }) => {
    const { t, i18n } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleEditClick = () => {
        dispatch(openUpdatePubPopup(pub));
    };

    const handleDeleteClick = () => {
        dispatch(
            openDeletePubPopup({ companyID: pub.company_id, pubID: pub.id })
        );
    };

    const handleOpenQrCode = () => {
        dispatch(openQrCodePopup({ imageFileName: pub.qr_code_file_name }));
    };

    const goToPub = () => {
        navigate(`/admin/company/pub/${pub.id}`);
    };

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "200px",
                transition: "all .2s ease-in-out",
            }}
            className="border p-6 rounded-lg shadow-xl hover:shadow-2xl flex flex-col justify-between"
        >
            <header className="flex justify-between mb-2">
                <div className="cursor-pointer">
                    <Image
                        onClick={handleOpenQrCode}
                        src="/images/svg/qr-code-black.svg"
                        alt="qr-code"
                        width={25}
                        height={25}
                    />
                </div>
                <div className="flex gap-2">
                    <div className="cursor-pointer" onClick={handleEditClick}>
                        <Image
                            src="/images/svg/settings-black.svg"
                            alt="settings"
                            width={25}
                            height={25}
                        />
                    </div>
                    <div className="cursor-pointer" onClick={handleDeleteClick}>
                        <Image
                            src="/images/svg/trash-can-black.svg"
                            alt="trash-can"
                            width={25}
                            height={25}
                        />
                    </div>
                </div>
            </header>
            <main className="block mb-2">
                <div className="mb-4 text-2xs text-gray-700">
                    {t("admin.company.pub.expiration_time")}
                    <br />
                    <span>
                        {ConvertQrMenuApiTimeToLocal(
                            pub.expiration_time_utc,
                            i18n.language
                        )}
                    </span>
                </div>
                <div className="mb text-base font-bold">{pub.name}</div>
                <div className="mb text-xs text-gray-700 break-words">
                    {t("admin.company.pub.address")}: {pub.address}
                </div>
                {pub.expired && (
                    <div className=" text-red-600 uppercase text-center py px-4 border border-red-600 mt-3 rounded-lg">
                        {t("admin.company.pub.expired")}
                    </div>
                )}
            </main>
            <footer
                className="flex flex-col text-center"
                style={
                    pub.expired
                        ? { mt: "4px", alignItems: "center" }
                        : { mt: "24px", alignItems: "left" }
                }
            >
                <Button
                    variant="contained"
                    sx={{
                        color: "white",
                        bgcolor: "rgb(31 41 55)",
                        fontSize: ".5rem",
                        fontWeight: "medium",
                        padding: ".4rem .5rem",
                        borderRadius: "20px",
                        textAlign: "left",
                        width: "90%",
                        ":hover": {
                            bgcolor: "rgb(17 24 39)",
                        },
                    }}
                    onClick={goToPub}
                >
                    {t("admin.company.pub.edit_menu_button")}
                </Button>
            </footer>
        </div>
    );
};

export default CompanyPub;
