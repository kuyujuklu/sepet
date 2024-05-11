"use client"

import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { closeTariffPopup, selectUpgradeTariffPopupState } from "./companySlice";
import { useCallback } from "react";
import Popup from "@/components/Popup/Popup";

const TariffPopup = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();
    const popupState = useSelector(selectUpgradeTariffPopupState);

    const closePopup = useCallback(() => {
        dispatch(closeTariffPopup());
    }, [dispatch]);

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header className="mb-8">
                    <h1 className="font-bold text-center text-2xl text-gray-800">
                        {t("admin.popups.upgrade_tariff_popup.header")}
                    </h1>
                </header>

                <main className="flex flex-col gap-6 p-6 mb-6 text-xl text-gray-800 font-medium text-left">
                    <span className="">
                        {t("admin.popups.upgrade_tariff_popup.main_headline")}
                    </span>
                    <div className="flex flex-col gap-2 items-start ml-6">
                        <span>
                            mdsandex@gmail.com
                        </span>
                        <span>
                            kuyujuklu1995@gmail.com
                        </span>
                        <span>
                            +373 675 07 188
                        </span>
                    </div>
                </main>
                <footer className="text-center">
                </footer>
            </div>
        </Popup>
    );
};

export default TariffPopup;
