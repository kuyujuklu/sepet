"use client";
import { useDispatch } from "react-redux";
import { useGetPubQuery } from "../../api/pub/pub";
import { useContext, useEffect } from "react";
import { openQrCodePopup, openUpdatePubPopup } from "./pubSlice";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "./PubPage";
import {
    errorKeys,
    setReceivingError,
} from "../errorHandlers/errorHandlerSlice";

const PubPageHeader = ({ pubImageFileName, pubName, pubUrlName, companyID, pubID }) => {
    const themeContext = useContext(ThemeContext);
    const dispatch = useDispatch();

    const { data, error } = useGetPubQuery({
        companyID: companyID,
        pubID: pubID,
    });

    useEffect(() => {
        if (!error) return;
        dispatch(
            setReceivingError({ errorKey: errorKeys.get_pub_by_id, error })
        );
    }, [dispatch, error]);

    const handleEditClick = () => {
        dispatch(openUpdatePubPopup(data.pub ?? {}));
    };


    const pubURL = `https://qrmenu.sandex.md/pub/${pubUrlName}/`

    const handleOpenQrCode = () => {
        dispatch(openQrCodePopup({ imageFileName: pubImageFileName }));
    };

    return (
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2">
            <h1
                className=" text-4xl font-medium"
                style={{
                    color: themeContext.textColor,
                }}
            >
                {pubName}
            </h1>

            <div className="flex items-center gap-4">
                <div className="cursor-pointer" onClick={handleOpenQrCode}>
                    <img
                        src={
                            themeContext.theme === "dark"
                                ? "/static/admin/images/svg/qr-code-white.svg"
                                : "/static/admin/images/svg/qr-code-black.svg"
                        }
                        alt="qr-code"
                        width={25}
                        height={25}
                    />
                </div>
                <div className="cursor-pointer" onClick={handleEditClick}>
                    <img
                        src={
                            themeContext.theme === "dark"
                                ? "/static/admin/images/svg/settings-white.svg"
                                : "/static/admin/images/svg/settings-black.svg"
                        }
                        alt="settings"
                        width={25}
                        height={25}
                    />
                </div>
                <NavLink to="/admin/company">
                    <div className="cursor-pointer">
                        <img
                            src={
                                themeContext.theme === "dark"
                                    ? "/static/admin/images/svg/profile-white.svg"
                                    : "/static/admin/images/svg/profile-black.svg"
                            }
                            alt="profile"
                            width={25}
                            height={25}
                        />
                    </div>
                </NavLink>
            </div>
        </div>
    );
};

export default PubPageHeader;
