import { useTranslation } from "react-i18next";

const CompanyUpper = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center p-10">
            <h1 className="text-2xl text-gray-800 font-bold">
                {t("admin.company.pubs")}
            </h1>
        </div>
    );
};

export default CompanyUpper;
