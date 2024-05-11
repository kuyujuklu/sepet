import { useTranslation } from "react-i18next";
import Inputs from "./Shipping/Inputs";

const Shipping = ({ pub }) => {
    const { t } = useTranslation();
    return (
        <>
            <h1 className="text-center text-gray-800 text-xl font-bold mt-2">
                {t("admin.admin_panel.shipping.headline")}
            </h1>
            <div className="m-auto">
                <Inputs pub={pub} />
            </div>
        </>
    );
};

export default Shipping;
