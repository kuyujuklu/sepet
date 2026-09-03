import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
    errorKeys,
    setReceivingError,
} from "../errorHandlers/errorHandlerSlice";
import { useGetCompanyQuery } from "../../api/company/company";
import Header from "./Header";
import Sidebar from "./Sidebar";
import SuperAdminImpersonationBanner from "./SuperAdminImpersonationBanner";
import BlackSpinner from "../../components/loaders/BlackSpinner";
import { Route, Routes, useParams, useLocation } from "react-router-dom";
import Home from "./Home/Home";
import { setCompanyID } from "../company/companySlice";
import Shipping from "./ShippingAndPreorder/Shipping";
import { setShipping } from "./ShippingAndPreorder/Shipping/shippingSlice";
import { useGetPubQuery, useGetShippingQuery } from "../../api/pub/pub";
import { setPubID } from "../pub/pubSlice";
import OrdersPreloader from "./Orders/OrdersPreloader";
import Orders from "./Orders/Orders";
import OrderInfoPage from "./Orders/OrderInfo/OrderInfoPage";
import PubPage from "../pub/PubPage";
import PubSettings from "./PubSettings/PubSettings";
import { setOrdersPreloader } from "./Orders/ordersSlice";
import { setLastUsedPubID } from "@/utils/lastUsedPub";

const AdminPanel = () => {
    const dispatch = useDispatch();
    const location = useLocation();

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

    // Feeds CompanyPage's "reopen whichever pub was used last" redirect.
    useEffect(() => {
        if (!companyData?.company?.id || !pubID) return;
        setLastUsedPubID(companyData.company.id, pubID);
    }, [companyData?.company?.id, pubID]);

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
                shipping_free_delivery_prices: shippingData.shipping_free_delivery_prices,
                shapes: shippingData.shapes,
            })
        );
    }, [dispatch, error, shippingData, shippingError]);

    return (
        <>
            <SuperAdminImpersonationBanner />
            {!pubData && (
                <div style={{width: "100vw",height: "100vh"}} className="absolute flex justify-center items-center">
                    <BlackSpinner />
                </div>
            )}
            {pubData?.pub && (
                <div className="lg:flex lg:gap-5 lg:items-start">
                    {/* Persistent left nav on wide screens - replaces the
                        mobile top bar below, per the approved canvas shell */}
                    <div className="hidden lg:block" style={{ paddingTop: 20 }}>
                        <Sidebar
                            pub={pubData.pub}
                            pubID={pubID}
                            companyID={companyData?.company?.id}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* The pub-switcher header only makes sense on Home -
                            every other mobile screen supplies its own back-
                            chevron PageHeader instead (matches the sidebar,
                            which is the only persistent chrome on desktop). */}
                        {(location.pathname === `/admin/pub/${pubID}` || location.pathname === `/admin/pub/${pubID}/`) && (
                            <nav className="lg:hidden mb-6">
                                <Header
                                    pubID={pubID}
                                    name={pubData?.pub?.name}
                                    address={pubData?.pub?.address}
                                    companyID={companyData?.company?.id}
                                />
                            </nav>
                        )}
                        <div className="pb-20 lg:pt-5">
                            <OrdersPreloader
                                companyID={companyData.company.id}
                                pubID={pubID}
                            />
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <Home
                                            pub={pubData.pub}
                                            companyID={companyData.company.id}
                                        />
                                    }
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
                                <Route
                                    path="/settings"
                                    element={
                                        <PubSettings
                                            pub={pubData.pub}
                                            companyID={companyData.company.id}
                                        />
                                    }
                                />
                            </Routes>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminPanel;
