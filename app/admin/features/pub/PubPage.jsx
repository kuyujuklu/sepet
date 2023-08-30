import { Route, Routes, useParams } from "react-router-dom";
import { useGetPubQuery } from "../../api/pub/pub";
import { createContext, useEffect, useMemo, useState } from "react";
import { useGetCompanyQuery } from "../../api/company/company";
import PubPageHeader from "./PubPageHeader";
import PubPageUpper from "./PubPageUpper";
import PubPageMain from "./PubPageMain";
import { useDispatch } from "react-redux";
import { setPubID } from "./pubSlice";
import { setCompanyID } from "../company/companySlice";
import Categories from "./Categories/Categories";
import Dishes from "./Dishes/Dishes";
import { appErrors } from "../../errors/errors";
import { requireAuthentication } from "../auth/authSlice";

export const ThemeContext = createContext({
    theme: "light",
    textColor: "#000000",
    bgColor: "#ffffff",
});

export const PubColorContext = createContext({
    color: "#000000",
});

const PubPage = () => {
    //setting contexts
    const [theme, setTheme] = useState({
        theme: "light",
        textColor: "#000000",
    });
    const value = useMemo(() => theme, [theme]);

    const [pubColorValue, setPubColorValue] = useState("#ffffff");

    const dispatch = useDispatch();

    //company and pub data
    const {
        data: companyData,
        // isLoading: isLoadingCompany,
        error: companyError,
    } = useGetCompanyQuery();

    useEffect(() => {
        if (companyError && companyError.text === appErrors.unauthorized) {
            dispatch(requireAuthentication())
        }
    }, [companyError, dispatch]);

    const pubID = useParams().pubID;
    const {
        data: pubData,
        // isLoading: isLoadingPub,
        error: pubError,
    } = useGetPubQuery({ companyID: companyData?.company?.id, pubID: pubID });

    useEffect(() => {
        if (pubData?.pub) {
            dispatch(setPubID(pubData.pub.id));
            dispatch(setCompanyID(companyData.company.id));
            if (pubData.pub.color_theme === "dark") {
                setTheme({
                    theme: "dark",
                    textColor: "#eeefff",
                    bgColor: "rgb(17 24 39)",
                });
                setPubColorValue(pubData.pub.color ?? "#eeefff");
            } else {
                setTheme({
                    theme: "light",
                    textColor: "#000000",
                    bgColor: "#eeefff",
                });
                setPubColorValue(pubData.pub.color ?? "#000000");
            }
        }
    }, [companyData?.company?.id, dispatch, pubData]);

    useEffect(() => {
        if (pubError && pubError.text === pubError.unauthorized) {
            dispatch(requireAuthentication())
        }
    }, [dispatch, pubError]);

    return (
        <ThemeContext.Provider value={value}>
            <PubColorContext.Provider value={pubColorValue}>
                {companyData?.company && pubData?.pub && (
                    <div
                        style={{
                            maxWidth: "600px",
                            margin: "auto",
                            height: "100%",
                            background: theme.bgColor,
                            minHeight: "200px",
                        }}
                        className={"relative rounded-3xl h-full"}
                    >
                        <PubPageUpper
                            imageFileName={pubData.pub.bg_image_file_name}
                            companyID={companyData.company.id}
                            pubID={pubData.pub.id}
                        />
                        <div
                            style={{
                                display: "block",
                                position: "relative",
                                top: "160px",
                                padding: "20px",
                                zIndex: 10,
                                background: theme.bgColor,
                            }}
                            className="rounded-2xl p-5"
                        >
                            <PubPageHeader
                                pubName={pubData.pub.name}
                                companyID={companyData.company.id}
                                pubID={pubData.pub.id}
                            />
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <div>
                                            <PubPageMain />
                                            <Categories />
                                        </div>
                                    }
                                />
                                <Route
                                    path="/menu/:menuID/category/:categoryID"
                                    element={<Dishes />}
                                />
                            </Routes>
                        </div>
                    </div>
                )}
            </PubColorContext.Provider>
        </ThemeContext.Provider>
    );
};

export default PubPage;
