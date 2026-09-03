"use client";

import { useEffect } from "react";
import { useGetCompanyQuery } from "../../api/company/company";
import { useGetPubsQuery } from "../../api/pub/pub";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    errorKeys,
    setReceivingError,
} from "../errorHandlers/errorHandlerSlice";
import BlackSpinner from "../../components/loaders/BlackSpinner";
import LogoutButton from "./LogoutButton";
import { useTranslation } from "react-i18next";
import usePageTitle from "@/hooks/usePageTitle";
import { getLastUsedPubID } from "@/utils/lastUsedPub";

// Pure entry point after login/registration - resolves which pub to open
// (whichever was used last, otherwise just the first one) and redirects
// there. There's no picker here anymore: switching between pubs lives in
// the header/sidebar dropdown on every pub screen instead, so this page
// never needs to be seen for more than a moment.
const CompanyPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { t } = useTranslation();
    usePageTitle(t("admin.company.pubs"));
    const { data, error } = useGetCompanyQuery(
        {},
        { refetchOnMountOrArgChange: true }
    );
    const companyID = data?.company?.id;

    const { data: pubsData } = useGetPubsQuery({ companyID }, { skip: !companyID });
    const pubs = pubsData?.pubs;

    useEffect(() => {
        if (!error) return;

        dispatch(setReceivingError({ errorKey: errorKeys.get_company, error }));
    }, [dispatch, error]);

    const lastUsedID = pubs ? getLastUsedPubID(companyID) : null;
    const lastUsedPub = pubs?.find((pub) => String(pub.id) === String(lastUsedID));
    const targetPub = lastUsedPub ?? pubs?.[0];

    useEffect(() => {
        if (!targetPub) return;
        navigate(`/admin/pub/${targetPub.id}`, { replace: true });
    }, [targetPub, navigate]);

    // Real-world rare, since pub creation isn't self-service - a company
    // with no pubs at all genuinely has nowhere to go.
    const noPubs = pubs && pubs.length === 0;

    return (
        <div className="flex flex-col items-center justify-center gap-4" style={{ minHeight: "100vh" }}>
            {noPubs ? (
                <>
                    <div style={{ fontSize: 14.5, color: "#526070" }}>{t("admin.company.no_pubs")}</div>
                    <LogoutButton />
                </>
            ) : (
                <BlackSpinner />
            )}
        </div>
    );
};

export default CompanyPage;
