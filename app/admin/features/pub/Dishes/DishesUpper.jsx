import { useContext } from "react";
import { ThemeContext } from "../PubPage";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DishesUpper = ({ categoryName, pubID }) => {
    const { t } = useTranslation();
    const themeContext = useContext(ThemeContext);

    return (
        <div className="flex items-center flex-wrap-reverse gap-6">
            <div
                style={{ color: themeContext.textColor }}
                className="text-2xl"
            >
                {categoryName}
            </div>
            <NavLink
                style={{ color: themeContext.textColor }}
                className={"rounded-xl text-center h-fit w-fit p-2 bg-red-600"}
                to={`/admin/company/pub/${pubID}`}
            >
                {t("admin.dishes.upper.return_back")}
            </NavLink>
        </div>
    );
};

export default DishesUpper;
