import Input from "@/app/admin/components/Inputs/Input";
import React from "react";
import { validateTableNumber } from "../validators";
import { useTranslation } from "react-i18next";

const TableNumberInput = ({ tableNumber, setTableNumber }) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center">
            <div
                className="text-lg sm:text-base text-gray-500 font-medium px-2"
                stlye={{ marginBottom: ".1rem" }}
            >
                {t("client.popups.create_order.table_number")}
            </div>
            <div style={{ maxWidth: "100px" }}>
                <Input
                    style={{ fontSize: "1rem" }}
                    value={tableNumber}
                    setValue={setTableNumber}
                    validators={[validateTableNumber]}
                />
            </div>
        </div>
    );
};

export default TableNumberInput;
