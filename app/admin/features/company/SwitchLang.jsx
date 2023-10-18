"use client"
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Button } from "@mui/material";
import { t } from "i18next";

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
        <div className="w-fit flex gap-4 flex-wrap">
            <div style={{minWidth: "50px"}}>{t("admin.language")}</div>
            <div className="flex gap-2">
                <div>
                    <Button
                        variant="contained"
                        sx={{
                            color: i18n.language === "ru" ? "white" : "black",
                            bgcolor: i18n.language === "ru" ? "rgb(31 41 55)" : "transparent",
                            border: "rgb(31 41 55)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".1rem",
                            borderRadius: "10px",
                            textAlign: "left",
                            ":hover": {
                                bgcolor: "rgb(17 24 39)",
                                color: "white",
                            },
                        }}
                        onClick={() => handleChangeLang("ru")}
                    >
                        RU
                    </Button>
                </div>
                <div>
                    <Button
                        variant="contained"
                        sx={{
                            color: i18n.language === "ro" ? "white" : "black",
                            bgcolor: i18n.language === "ro" ? "rgb(31 41 55)" : "transparent",
                            width: "fit-content",
                            border: "rgb(31 41 55)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".1rem",
                            borderRadius: "10px",
                            textAlign: "left",
                            ":hover": {
                                bgcolor: "rgb(17 24 39)",
                                color: "white",
                            },
                        }}
                        onClick={() => handleChangeLang("ro")}
                    >
                        RO
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SwitchLang;