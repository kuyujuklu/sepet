"use client";

import { useEffect } from "react";
import { useGetCompanyQuery } from "../../api/company/company";
import { useDispatch } from "react-redux";
import CompanyUpper from "./CompanyUpper";
import CompanyPubs from "./CompanyPubs";
import {
    errorKeys,
    setReceivingError,
} from "../errorHandlers/errorHandlerSlice";
import CompanyTariff from "./CompanyTariff";
import Navbar from "../../components/Errors/Navbar/Navbar";

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
        <>
            <div className="pb-20">
                <Navbar />
                <div className="flex items-center justify-center my-8">
                    {data && <CompanyTariff tariff={data.company.tariff} />}
                </div>

                <div className="my-10">
                    <CompanyUpper />
                </div>
                <CompanyPubs companyID={data?.company?.id} />
            </div>
        </>
    );
};

export default CompanyPage;
