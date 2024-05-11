import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

const Header = ({ name, pubID }) => {
    const { t } = useTranslation();
    const location = useLocation();
    console.log("LOCATIONL: ", location);

    const isOnAdminHomePage =
        location.pathname === `/admin/pub/${pubID}` ||
        location.pathname === `/admin/pub/${pubID}/`;

    return (
        <h1 className="text-2xl flex justify-center items-center gap-5 text-gray-800 mt-4">
            <NavLink to="/admin/company">
                <div style={{ width: 35, height: 35 }}>
                    <img src="/static/admin/images/svg/home-black.svg" alt="lkajsdf" />
                </div>
            </NavLink>
            {!isOnAdminHomePage && (
                <NavLink to={`/admin/pub/${pubID}`}>
                    <div style={{ width: 35, height: 35 }}>
                        <img
                            src="/static/admin/images/svg/arrow-left-violet.svg"
                            alt="lkajsdf"
                        />
                    </div>
                </NavLink>
            )}
            <div>
                <span className="font-medium">
                    {t("admin.admin_panel.main_page.headline")}{" "}
                </span>{" "}
                <span className="font-bold">{name}</span>{" "}
            </div>
        </h1>
    );
};

export default Header;
