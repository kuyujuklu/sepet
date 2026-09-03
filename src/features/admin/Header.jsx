import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { useGetPubsQuery } from "../../api/pub/pub";
import { useLazyLogoutQuery } from "@/api/auth/authQuery";
import { setLastUsedPubID } from "@/utils/lastUsedPub";
import { errorKeys, setReceivingError } from "../errorHandlers/errorHandlerSlice";
import { ChevronDownIcon } from "./Home/icons";

// Home-only mobile identity header, matching the HomeMobile canvas mockup:
// initials avatar + pub name/switcher + address. The switcher dropdown also
// carries "Выход" instead of a separate always-on button, since this is the
// one piece of persistent chrome mobile has.
const Header = ({ name, address, pubID, companyID }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const [switcherOpen, setSwitcherOpen] = useState(false);

    const { data: pubsData } = useGetPubsQuery({ companyID }, { skip: !companyID });
    const pubs = pubsData?.pubs ?? [];
    const hasMultiplePubs = pubs.length > 1;
    const initials = (name ?? "").trim().slice(0, 2).toUpperCase() || "?";

    const [logoutQuery, { data: logoutData, error: logoutError }] = useLazyLogoutQuery();

    useEffect(() => {
        dispatch(setReceivingError({ errorKey: errorKeys.logout, error: logoutError }));
    }, [dispatch, logoutError]);

    useEffect(() => {
        if (!logoutData?.ok) return;
        window.location.pathname = "/";
    }, [logoutData]);

    return (
        <div style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => setSwitcherOpen((open) => !open)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#e8f1fb",
                        color: "#2D7DD2",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 15,
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </div>
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div className="flex items-center" style={{ gap: 4 }}>
                        <div
                            style={{
                                fontSize: 16,
                                fontWeight: 700,
                                color: "#1c2733",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {name}
                        </div>
                        <ChevronDownIcon stroke="#94a3b0" style={{ flexShrink: 0 }} />
                    </div>
                    {address && (
                        <div className="truncate" style={{ fontSize: 11.5, color: "#94a3b0" }}>
                            {address}
                        </div>
                    )}
                </div>
            </button>

            {switcherOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: 8,
                        background: "#fff",
                        border: "1px solid #e4e9ee",
                        borderRadius: 12,
                        boxShadow: "0 8px 20px rgba(20,30,45,.14)",
                        zIndex: 30,
                        minWidth: 220,
                        overflow: "hidden",
                    }}
                >
                    {hasMultiplePubs && (
                        <>
                            {pubs.map((otherPub) => (
                                <NavLink
                                    key={otherPub.id}
                                    to={`/admin/pub/${otherPub.id}`}
                                    onClick={() => {
                                        setLastUsedPubID(companyID, otherPub.id);
                                        setSwitcherOpen(false);
                                    }}
                                    style={{
                                        display: "block",
                                        padding: "11px 14px",
                                        fontSize: 14,
                                        fontWeight: String(otherPub.id) === String(pubID) ? 700 : 500,
                                        color: String(otherPub.id) === String(pubID) ? "#2D7DD2" : "#1c2733",
                                        textDecoration: "none",
                                    }}
                                >
                                    {otherPub.name}
                                </NavLink>
                            ))}
                            <hr style={{ border: "none", borderTop: "1px solid #e4e9ee", margin: 0 }} />
                        </>
                    )}
                    <button
                        type="button"
                        onClick={() => logoutQuery()}
                        style={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            padding: "11px 14px",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#e0483a",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        {t("admin.logout")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;
