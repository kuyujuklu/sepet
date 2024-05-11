import { useTranslation } from "react-i18next";
import style from "../../sass/components/company-inline-select/company-inline-select.module.scss";
import { tariffs } from "../../static-data/data";
import { useDispatch } from "react-redux";
import { openTariffPopup } from "./companySlice";

const CompanyTariff = ({ tariff }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const openUpgradeTariffPopup = () => {
        dispatch(openTariffPopup())
    }

    return (
        <div>
            <div className="text-center flex flex-col sm:flex-row items-center gap-x-6 gap-y-2">
                <span className="text-xl sm:text-2xl text-center sm:text-left text-gray-800 font-bold w-fit">
                    {t("admin.company.tariff")}:{" "}
                </span>

                <div className="flex gap-4 ">
                    <div
                        className={`${style.inlineSelectItem} ${
                            tariff == tariffs.basic && style.active
                        }`}
                        onClick={() => openUpgradeTariffPopup()}
                    >
                        {t("admin.company.tariff_basic")}
                    </div>

                    <div
                        className={`${style.inlineSelectItem} ${
                            tariff == tariffs.pro && style.active
                        }`}
                        onClick={() => openUpgradeTariffPopup()}
                    >
                        {t("admin.company.tariff_pro")}
                    </div>

                    <div
                        className={`${style.inlineSelectItem} ${
                            tariff == tariffs.business && style.active
                        }`}
                        onClick={() => openUpgradeTariffPopup()}
                    >
                        {t("admin.company.tariff_business")}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyTariff;
