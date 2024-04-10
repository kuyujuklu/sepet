import { Button } from "@mui/material";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

const SwitchLang = () => {
    const { i18n } = useTranslation();

    const handleChangeLang = async (lang) => {
        i18n.changeLanguage(lang);
    };

    useEffect(() => {
        (async function () {
            if (i18n.language === "ru-RU" || i18n.language === "ru") {
                i18n.changeLanguage("ru");
                return
            }
            if (i18n.language === "ro-RO" || i18n.language === "ro") {
                i18n.changeLanguage("ro");
                return
            }
            i18n.changeLanguage("ru");
        })();
    }, [i18n]);
    return (
        <div className="flex flex-col items-center gap-y-2">
            <Button
                variant="contained"
                sx={{
                    color: "white",
                    bgcolor:
                        i18n.language === "ru"
                            ? "rgb(31 41 55)"
                            : "rgb(17 24 39)",
                    border: "rgb(17 24 39)",
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".1rem",
                    borderRadius: "10px",
                    textAlign: "left",
                    ":hover": {
                        bgcolor: i18n.language === "ru"
                        ? "rgb(31 41 55)"
                        : "rgb(17 24 39)",
                    },
                }}
                onClick={() => handleChangeLang("ru")}
            >
                RU
            </Button>
            <Button
                variant="contained"
                sx={{
                    color: i18n.language === "white",
                    bgcolor:
                        i18n.language === "ro"
                            ? "rgb(31 41 55)"
                            : "rgb(17 24 39)",
                    border: "rgb(17 24 39)",
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".1rem",
                    borderRadius: "10px",
                    textAlign: "left",
                    ":hover": {
                        bgcolor: i18n.language === "ro"
                        ? "rgb(31 41 55)"
                        : "rgb(17 24 39)",
                    },
                }}
                onClick={() => handleChangeLang("ro")}
            >
                RO
            </Button>
        </div>
    );
};

export default SwitchLang;
