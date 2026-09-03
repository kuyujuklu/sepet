"use client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import SelectWithLabel from "@/components/Inputs/SelectWithLabel";
import Textarea from "@/components/Inputs/Textarea";
import WhiteSpinner from "@/components/loaders/WhiteSpinner";
import { useUpdatePubMutation, useDeletePubMutation } from "@/api/pub/pub";
import { useGetCompanyQuery } from "@/api/company/company";
import { ValidatePub, ValidatePubName } from "@/validation/validatePub";
import { currencies, defaultServiceType, serviceTypes, tariffs } from "@/static-data/data";
import { ConvertQrMenuApiTimeToLocal } from "@/utils/time";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/usePageTitle";
import PageHeader from "@/components/design/PageHeader";
import SwitchLang from "@/features/company/SwitchLang";

const tariffLabelKey = {
    [tariffs.basic]: "admin.company.tariff_basic",
    [tariffs.pro]: "admin.company.tariff_pro",
    [tariffs.business]: "admin.company.tariff_business",
};

// Replaces UpdatePubPopup/DeletePubPopup/QrCodePopup - one page instead of
// three popups plus the tariff/subscription display that used to live on
// CompanyPage. Reuses their exact fields, mutations, and translation keys;
// only the source of companyID/pubID changed (route + AdminPanel props
// instead of popup-carried state).
const PubSettings = ({ pub, companyID }) => {
    const { t, i18n } = useTranslation();
    usePageTitle(t("admin.pub_settings.headline"));
    const navigate = useNavigate();

    const { data: companyData } = useGetCompanyQuery();

    const [updatePub, { isLoading: isSaving }] =
        useUpdatePubMutation({ fixedCacheKey: fixedCacheKeys.pubs.update_pub });
    const [deletePub, { data: deleteData, isLoading: isDeleting }] =
        useDeletePubMutation({ fixedCacheKey: fixedCacheKeys.pubs.delete_pub });

    const [name, setName] = useState("");
    const [colorTheme, setColorTheme] = useState("");
    const [color, setColor] = useState("#ffffff");
    const [wifiPassword, setWifiPassword] = useState("");
    const [address, setAddress] = useState("");
    const [telegramUsername, setTelegramUsername] = useState("");
    const [hasInPlaceOrder, setHasInPlaceOrder] = useState(false);
    const [additionalInfo, setAdditionalInfo] = useState("");
    const [currencyID, setCurrencyID] = useState(1);
    const [serviceType, setServiceType] = useState(defaultServiceType);
    const [colorPickerOpened, setColorPickerOpened] = useState(false);
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    useEffect(() => {
        if (!pub) return;
        setName(pub.name ?? "");
        setColorTheme(pub.color_theme ?? "");
        setColor(pub.color ?? "#ffffff");
        setWifiPassword(pub.wifi_password ?? "");
        setAddress(pub.address ?? "");
        setAdditionalInfo(pub.additional_info ?? "");
        setCurrencyID(pub.currency_id ?? 1);
        setTelegramUsername(pub.telegram_username ?? "");
        setHasInPlaceOrder(pub.has_in_place_order ?? false);
        setServiceType(pub.section ?? pub.service_types?.[0] ?? defaultServiceType);
    }, [pub]);

    useEffect(() => {
        if (!deleteData) return;
        navigate("/admin/company");
    }, [deleteData, navigate]);

    const handleSave = () => {
        const data = {
            name,
            colorTheme,
            color,
            wifiPassword,
            address,
            additionalInfo,
            currencyID: +currencyID,
            telegramUsername,
            hasInPlaceOrder,
            serviceType,
        };

        if (ValidatePub(data).length > 0) return;
        if (!companyID || !pub?.id) return;

        updatePub({ data, companyID, pubID: pub.id });
    };

    const handleDelete = () => {
        if (!companyID || !pub?.id) return;
        deletePub({ companyID, pubID: pub.id });
    };

    if (!pub) return null;

    const pubURL = `https://qrmenu.sandex.md/pub/${pub.url_name}/`;

    return (
        <div className="flex flex-col gap-6 max-w-xl mx-auto pb-20 px-2">
            <PageHeader title={t("admin.pub_settings.headline")} backTo={`/admin/pub/${pub.id}`} />

            {/* Language - moved here from the always-visible top bar, since
                it's a set-once preference, not something worth a permanent
                slot in every page's chrome */}
            <section className="flex items-center justify-between border rounded-2xl p-5">
                <span className="text-sm font-medium text-gray-500">
                    {t("admin.pub_settings.language_headline")}
                </span>
                <SwitchLang />
            </section>

            {/* Basic info + appearance - same fields as the old UpdatePubPopup */}
            <section className="flex flex-col gap-6 border rounded-2xl p-5">
                <InputWithLabel
                    label={t("admin.popups.update_pub_popup.name")}
                    labelClassName="text-xs sm:text-base text-gray-500 font-medium"
                    labelStyle={{ marginBottom: ".1rem" }}
                    value={name}
                    setValue={setName}
                    validators={[ValidatePubName]}
                />
                <InputWithLabel
                    label={t("admin.popups.update_pub_popup.wifi_password")}
                    labelClassName="text-xs sm:text-base text-gray-500 font-medium"
                    value={wifiPassword}
                    setValue={setWifiPassword}
                />
                <SelectWithLabel
                    wrapperClass="flex items-center gap-4"
                    label={t("admin.popups.update_pub_popup.currency")}
                    labelClassName="text-sm sm:text-base text-gray-500 font-medium"
                    selectClassName="text-xs sm:text-sm"
                    value={currencyID}
                    setValue={setCurrencyID}
                    values={currencies.map((currency) => ({
                        value: currency.id,
                        text: currency.name + " " + currency.symbol,
                    }))}
                />
                <SelectWithLabel
                    wrapperClass="flex items-center gap-4"
                    label={t("admin.popups.update_pub_popup.service_type")}
                    labelClassName="text-sm sm:text-base text-gray-500 font-medium"
                    selectClassName="text-xs sm:text-sm"
                    value={serviceType}
                    setValue={setServiceType}
                    values={Object.keys(serviceTypes).map((key) => ({
                        value: serviceTypes[key].value,
                        text: t(serviceTypes[key].text),
                    }))}
                />
                <SelectWithLabel
                    wrapperClass="flex items-center gap-4"
                    label={t("admin.popups.update_pub_popup.has_in_place_order")}
                    labelClassName="text-sm sm:text-base text-gray-500 font-medium"
                    selectClassName="text-xs sm:text-sm"
                    value={hasInPlaceOrder}
                    setValue={(value) => setHasInPlaceOrder(value === "true")}
                    values={[
                        { value: true, text: t("admin.popups.update_pub_popup.yes") },
                        { value: false, text: t("admin.popups.update_pub_popup.no") },
                    ]}
                />
                <div>
                    <div className="flex items-center gap-10">
                        <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">
                            {t("admin.popups.update_pub_popup.favorite_color")}
                        </span>
                        <div
                            style={{ width: "60px", height: "30px", background: color }}
                            className="cursor-pointer border-4 rounded-lg"
                            onClick={() => setColorPickerOpened(!colorPickerOpened)}
                        ></div>
                    </div>
                    {colorPickerOpened && (
                        <div className="mt-2">
                            <HexColorPicker color={color} onChange={setColor} />
                        </div>
                    )}
                </div>
                <SelectWithLabel
                    wrapperClass="flex items-center gap-4"
                    label={t("admin.popups.update_pub_popup.theme.title")}
                    labelClassName="text-sm sm:text-base text-gray-500 font-medium"
                    selectClassName="text-xs sm:text-sm"
                    value={colorTheme}
                    setValue={setColorTheme}
                    values={[
                        { value: "light", text: t("admin.popups.update_pub_popup.theme.light") },
                        { value: "dark", text: t("admin.popups.update_pub_popup.theme.dark") },
                    ]}
                />
                <InputWithLabel
                    label={t("admin.popups.update_pub_popup.address")}
                    labelClassName="text-xs sm:text-base text-gray-500 font-medium"
                    value={address}
                    setValue={setAddress}
                />
                <div className="flex items-end">
                    <div className="flex justify-center items-end mr-5">
                        <img width={40} height={40} src="/static/admin/images/png/telegram_logo.png" alt="telegram" />
                    </div>
                    <div className="w-4/5">
                        <InputWithLabel
                            label={t("admin.popups.update_pub_popup.telegram_username")}
                            labelClassName="text-xs sm:text-base text-gray-500 font-medium"
                            value={telegramUsername}
                            setValue={setTelegramUsername}
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">
                        {t("admin.popups.update_pub_popup.additional_info")}
                    </span>
                    <Textarea value={additionalInfo} setValue={setAdditionalInfo} />
                </div>

                <Button
                    variant="contained"
                    sx={{
                        color: "white",
                        bgcolor: "rgb(31 41 55)",
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        padding: ".5rem 0",
                        borderRadius: "10px",
                        ":hover": { bgcolor: "rgb(17 24 39)" },
                    }}
                    onClick={handleSave}
                >
                    {isSaving ? <WhiteSpinner /> : t("admin.popups.update_pub_popup.save_button")}
                </Button>
            </section>

            {/* QR code */}
            <section className="flex flex-col items-center gap-4 border rounded-2xl p-5">
                <h2 className="font-bold text-gray-800">{t("admin.pub_settings.qr_headline")}</h2>
                <div style={{ maxHeight: 220, maxWidth: 220 }} className="w-full relative m-auto aspect-square">
                    <img src={"/api-static/images/pubs/qr/" + pub.qr_code_file_name} alt="qr code" />
                </div>
                <a href={pubURL} className="text-blue-500 break-all text-center">
                    {pubURL}
                </a>
            </section>

            {/* Subscription - not self-service editable, contact admin to change */}
            <section className="flex flex-col gap-3 border rounded-2xl p-5">
                <h2 className="font-bold text-gray-800">
                    {t("admin.company.tariff")}
                    {companyData?.company?.tariff && (
                        <>: {t(tariffLabelKey[companyData.company.tariff] ?? "admin.company.tariff_basic")}</>
                    )}
                </h2>
                <div className="text-sm text-gray-700">
                    {t("admin.company.pub.expiration_time")}:{" "}
                    {ConvertQrMenuApiTimeToLocal(pub.expiration_time_utc, i18n.language)}
                </div>
                {pub.expired && (
                    <div className="text-red-600 uppercase text-center py px-4 border border-red-600 rounded-lg">
                        {t("admin.company.pub.expired")}
                    </div>
                )}
                <p className="text-sm text-gray-700">
                    {t("admin.popups.pay_for_pub_popup.main_headline")}
                </p>
                <div className="flex flex-col gap-1 text-sm text-gray-700">
                    <span>mdsandex@gmail.com</span>
                    <span>kuyujuklu1995@gmail.com</span>
                    <span>+373 675 07 188</span>
                </div>
            </section>

            {/* Danger zone */}
            <section className="flex flex-col gap-3 border border-red-300 bg-red-50 rounded-2xl p-5">
                <h2 className="text-red-600 font-bold">{t("admin.popups.delete_pub_popup.headline")}</h2>
                <p className="text-sm text-gray-700">
                    {t("admin.popups.delete_pub_popup.text")} {t("admin.popups.delete_pub_popup.warning")}
                </p>
                {!confirmingDelete ? (
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor: "rgb(220 38 38)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".5rem 0",
                            borderRadius: "10px",
                            ":hover": { bgcolor: "rgb(185 28 28)" },
                        }}
                        onClick={() => setConfirmingDelete(true)}
                    >
                        {t("admin.popups.delete_pub_popup.delete_button")}
                    </Button>
                ) : (
                    <div className="flex gap-3">
                        <Button
                            variant="contained"
                            sx={{
                                color: "white",
                                bgcolor: "rgb(220 38 38)",
                                fontSize: ".7rem",
                                fontWeight: "medium",
                                padding: ".5rem 0",
                                borderRadius: "10px",
                                flexGrow: 1,
                                ":hover": { bgcolor: "rgb(185 28 28)" },
                            }}
                            onClick={handleDelete}
                        >
                            {isDeleting ? <WhiteSpinner /> : t("admin.popups.delete_pub_popup.delete_button")}
                        </Button>
                        <Button
                            variant="outlined"
                            sx={{ flexGrow: 1 }}
                            onClick={() => setConfirmingDelete(false)}
                        >
                            {t("admin.pub_settings.cancel_button")}
                        </Button>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PubSettings;
