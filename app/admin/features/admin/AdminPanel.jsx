import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { errorKeys, setReceivingError } from "../errorHandlers/errorHandlerSlice";
import { useGetCompanyQuery } from "../../api/company/company";
import Header from "./Header";
import BlackSpinner from "../../components/loaders/BlackSpinner";
import { Route, Routes, useParams } from "react-router-dom";
import Sections from "./Sections";
import { setCompanyID } from "../company/companySlice";
import Shipping from "./ShippingAndPreorder/Shipping/Shipping";
import {  setShipping } from "./ShippingAndPreorder/Shipping/shippingSlice";
import { useGetPubQuery, useGetShippingQuery } from "../../api/pub/pub";

const AdminPanel = () => {
    const dispatch = useDispatch();
    
    //SETTING COMPANY DATA
    const {
        data: companyData,
        error: companyError,
    } = useGetCompanyQuery();

    useEffect(() => {
        if(!companyError) return;
        dispatch(setReceivingError({errorKey: errorKeys.get_company, error: companyError}))
    }, [companyError, dispatch]);
    useEffect(() => {
        if(companyData) {
            dispatch(setCompanyID(companyData.company.id))
        }
    }, [companyData, dispatch])

    //SETTING PUB
    const pubID = useParams().pubID
    const {
        data: pubData,
        error,
    } = useGetPubQuery({ pubID, companyID: companyData?.company?.id });

    useEffect(() => {
        if(!error) return;

        dispatch(setReceivingError({errorKey: errorKeys.get_menus, error}))
    }, [dispatch, error]);

    const {
        data: shippingData,
        error: shippingError,
    } = useGetShippingQuery({ pubID });

    useEffect(() => {
        if(!shippingError) {
            dispatch(setReceivingError({errorKey: errorKeys.get_pub_shipping, error}))
        }

        if(!shippingData) return;
        dispatch(setShipping({
            available: shippingData.available,
            shapes: shippingData.shapes
        }))
    }, [dispatch, error, shippingData, shippingError])


  return (
    <>
        {!pubData &&
            <div className="flex justify-center items-center">
                <BlackSpinner />
            </div>
        }
        {
            pubData?.pub && 
            <div>
                <div className="mb-6">
                    <Header name={pubData.pub.name} />
                </div>
                    <Routes>
                        <Route path="/" element={<Sections pub={pubData.pub} />} />
                        <Route path="/shipping" element={<Shipping pub={pubData.pub} />} />
                    </Routes>
                <Sections />
            </div>
        }
    </>
  )
}

export default AdminPanel