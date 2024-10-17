import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    errorKeys,
    setReceivingError,
} from "../errorHandlers/errorHandlerSlice";
import { useGetCompanyQuery } from "../../api/company/company";
import Header from "./Header";
import BlackSpinner from "../../components/loaders/BlackSpinner";
import { Route, Routes, useParams } from "react-router-dom";
import Sections from "./Sections";
import { setCompanyID } from "../company/companySlice";
import Shipping from "./ShippingAndPreorder/Shipping";
import { setShipping } from "./ShippingAndPreorder/Shipping/shippingSlice";
import { pub, useGetPubQuery, useGetShippingQuery } from "../../api/pub/pub";
import { setPubID } from "../pub/pubSlice";
import OrdersPreloader from "./Orders/OrdersPreloader";
import Orders from "./Orders/Orders";
import OrderInfoPage from "./Orders/OrderInfo/OrderInfoPage";
import PubPage from "../pub/PubPage";
import { setOrdersPreloader } from "./Orders/ordersSlice";
import Navbar from "../../components/Errors/Navbar/Navbar";
import SwitchLang from "../company/SwitchLang";
import LogoutButton from "../company/LogoutButton";

const AdminPanel = () => {
    const dispatch = useDispatch();

    //SETTING COMPANY DATA
    const { data: companyData, error: companyError } = useGetCompanyQuery();

    useEffect(() => {
        if (!companyError) return;
        dispatch(
            setReceivingError({
                errorKey: errorKeys.get_company,
                error: companyError,
            })
        );
    }, [companyError, dispatch]);
    useEffect(() => {
        if (companyData) {
            dispatch(setCompanyID(companyData.company.id));
        }
    }, [companyData, dispatch]);

    //SETTING PUB
    const pubID = useParams().pubID;
    const { data: pubData, error } = useGetPubQuery({
        pubID,
        companyID: companyData?.company?.id,
    });

    useEffect(() => {
        if (!pubID) return;
        dispatch(setPubID(pubID));
    }, [dispatch, pubID]);

    useEffect(() => {
        if (!error) return;

        dispatch(setReceivingError({ errorKey: errorKeys.get_menus, error }));
    }, [dispatch, error]);

    useEffect(() => {
        if (companyData && pubID) {
            dispatch(
                setOrdersPreloader({
                    companyID: companyData.company.id,
                    pubID: pubID,
                })
            );
        }
    }, [companyData, dispatch, pubID]);

    const { data: shippingData, error: shippingError } = useGetShippingQuery({
        pubID,
    });

    useEffect(() => {
        if (!shippingError) {
            dispatch(
                setReceivingError({
                    errorKey: errorKeys.get_pub_shipping,
                    error,
                })
            );
        }

        if (!shippingData) return;
        dispatch(
            setShipping({
                available: shippingData.available,
                shipping_time_from: shippingData.shipping_time_from,
                shipping_time_to: shippingData.shipping_time_to,
                shipping_work_start: shippingData.shipping_work_start,
                shipping_work_end: shippingData.shipping_work_end,
                shipping_prices: shippingData.shipping_prices,
                shapes: shippingData.shapes,
            })
        );
    }, [dispatch, error, shippingData, shippingError]);

    return (
        <>
            {!pubData && (
                <div style={{width: "100vw",height: "100vh"}} className="absolute flex justify-center items-center">
                    <BlackSpinner />
                </div>
            )}
            {pubData?.pub && (
                <>
                    <nav className="bg-white shadow-lg mb-8 rounded-xl pb-2 sm:pb-0">
                        <div className="max-w-6xl mx-auto px-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between">
                                <div className="flex space-x-7">
                                    <div className="pb-2 px-2">
                                        <Header pubID={pubID} name={pubData?.pub?.name} />
                                    </div>
                                    {/* <!-- Primary Navbar items --> */}
                                </div>
                                {/* <!-- Secondary Navbar items --> */}
                                <div className=" flex justify-start space-x-3">
                                    <div className="w-fit flex justify-start items-center gap-4">
                                        <SwitchLang />
                                        <LogoutButton />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <div className="pb-20">
                        <OrdersPreloader
                            companyID={companyData.company.id}
                            pubID={pubID}
                        />
                        <Routes>
                            <Route
                                path="/"
                                element={<Sections pub={pubData.pub} />}
                            />
                            <Route
                                path="/shipping"
                                element={<Shipping pub={pubData.pub} />}
                            />
                            <Route
                                path="/orders"
                                element={<Orders pub={pubData.pub} />}
                            />
                            <Route
                                path="/order/:orderID/*"
                                element={
                                    <OrderInfoPage
                                        pubUrlName={pubData?.pub.url_name}
                                        pubDishes={pubData.dishes}
                                    />
                                }
                            />
                            <Route path="/edit_menu/*" element={<PubPage />} />
                        </Routes>
                        <Sections />
                    </div>
                </>
            )}
        </>
    );
};

export default AdminPanel;
