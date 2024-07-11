"use client"

import { useEffect } from "react";
import { setData } from "../../store/pubInfoSlice";
import { useDispatch } from "react-redux";
import { setBasketPubID } from "../../store/basketSlice";

const DataToStateUploader = ({ data }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (data) dispatch(setData(data));
        if (data?.pub) {
            console.log("set basket pub id", data.pub.url_name);
            dispatch(setBasketPubID(data.pub.url_name));
        }
    }, [data, dispatch]);
    return <></>;
};
  
export default DataToStateUploader