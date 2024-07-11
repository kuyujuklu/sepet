"use client"

import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const SwitchLang = ({pubUrlName}) => {
    const { i18n } = useTranslation();

    const router = useRouter()

    const handleChangeLang = async (lang) => {
        if(i18n.language === lang) return;
        router.push(`/${lang}/pub/${pubUrlName}`)
    };

    return (
        <div className="flex flex-col items-center gap-y-2">
            <Button
                variant="contained"
                style={{
                    color: "white",
                    background:
                        i18n.language === "ru"
                            ? "rgb(31 41 55)"
                            : "rgb(17 24 39)",
                    border: "rgb(17 24 39)",
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".1rem",
                    borderRadius: "10px",
                    textAlign: "left",
                }}
                sx={{
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
                style={{
                    color: "white",
                    background:
                        i18n.language === "ro"
                            ? "rgb(31 41 55)"
                            : "rgb(17 24 39)",
                    border: "rgb(17 24 39)",
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".1rem",
                    borderRadius: "10px",
                    textAlign: "left",
                }}
                sx={{
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
