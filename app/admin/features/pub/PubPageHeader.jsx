import Image from "next/image";
import { useDispatch } from "react-redux";
import { useGetPubQuery } from "../../api/pub/pub";
import { useContext, useEffect } from "react";
import { openUpdatePubPopup } from "./pubSlice";
import { NavLink } from "react-router-dom";
import { ThemeContext } from "./PubPage";

const PubPageHeader = ({ pubName, companyID, pubID }) => {
	const themeContext = useContext(ThemeContext);
	const dispatch = useDispatch();

    const { data, error } = useGetPubQuery({
        companyID: companyID,
        pubID: pubID,
    });
    useEffect(() => {
        if (error) {
            //TODO: handle error
        }
    }, [error]);

    const handleEditClick = () => {
        dispatch(openUpdatePubPopup(data.pub ?? {}));
    };


    return (
        <div 
            className="flex items-center flex-wrap gap-x-6 gap-y-2"
        >
            <h1
                className=" text-4xl font-medium"
                style={{
                    color: themeContext.textColor,
                }}
            >
                {pubName}
            </h1>

            <div className="flex items-center gap-4">
                <div className="cursor-pointer">
                    <Image
                        src={themeContext.theme === "dark" ? "/images/svg/qr-code-white.svg" : "/images/svg/qr-code-black.svg"} 
                        alt="qr-code"
                        width={25}
                        height={25}
                    />
                </div>
                <div className="cursor-pointer" onClick={handleEditClick}>
                    <Image
                        src={themeContext.theme === "dark" ? "/images/svg/settings-white.svg" : "/images/svg/settings-black.svg"} 
                        alt="settings"
                        width={25}
                        height={25}
                    />
                </div>
                <NavLink to="/admin/company">
                    <div className="cursor-pointer">
                        <Image
                            src={themeContext.theme === "dark" ? "/images/svg/profile-white.svg" : "/images/svg/profile-black.svg"} 
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
