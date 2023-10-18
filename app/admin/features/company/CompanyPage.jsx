"use client";

import { useEffect } from "react";
import { useGetCompanyQuery } from "../../api/company/company";
import { useDispatch } from "react-redux";
import CompanyUpper from "./CompanyUpper";
import CompanyPubs from "./CompanyPubs";
import SwitchLang from "./SwitchLang";
import {
    errorKeys,
    setReceivingError,
} from "../errorHandlers/errorHandlerSlice";
import LogoutButton from "./LogoutButton";

const CompanyPage = () => {
    const dispatch = useDispatch();
    const { data, error } = useGetCompanyQuery(
        {},
        { refetchOnMountOrArgChange: true }
    );

    useEffect(() => {
        if (!error) return;

        dispatch(setReceivingError({ errorKey: errorKeys.get_company, error }));
    }, [dispatch, error]);

    return (
        <div className="pb-20">
            <div className="w-fit m-auto flex flex-col items-start gap-4 justify-center">
                <SwitchLang />
                <LogoutButton />
            </div>
            <CompanyUpper />
            <CompanyPubs companyID={data?.company?.id} />
        </div>
    );
};

export default CompanyPage;
