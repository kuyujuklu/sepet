import { useTranslation } from "react-i18next";
import Inputs from "./Shipping/Inputs";
import usePageTitle from "@/hooks/usePageTitle";

const Shipping = ({ pub }) => {
    const { t } = useTranslation();
    usePageTitle(t("admin.admin_panel.shipping.headline"));
    return (
        <div className="m-auto">
            <Inputs pub={pub} />
        </div>
    );
};

export default Shipping;
