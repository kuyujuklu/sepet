"use client"
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
    closeCreateOrderPopup,
    selectCreateOrderPopupState,
} from "../../store/orderSlice";
import { useCreateOrderMutation } from "../../api/rtk-query/orders";
import { useCallback, useEffect, useMemo, useState } from "react";
import Popup from "@/app/shared-components/Popup/Popup";
import SelectOrderTypePage from "./CreateOrderPopupPages/SelectOrderTypePage";
import { orderPaymentTypes, orderTypes } from "@/app/static-data/data";
import TableNumberInput from "./CreateOrderPopupPages/TableNumberInput";
import AddressAndPhoneInputs from "./CreateOrderPopupPages/AddressAndPhoneInputs";
import CreateOrderPage from "./CreateOrderPopupPages/CreateOrderPage";
import { selectData } from "../../store/pubInfoSlice";
import { validateOrder } from "./validators";
import {
    clearBasket,
    selectDishes,
    setLastOrder,
} from "../../store/basketSlice";

const CreateOrderPopup = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const popupState = useSelector(selectCreateOrderPopupState);
    const basket = useSelector(selectDishes);
    const pub = useSelector(selectData)?.pub;
    const pubDishes = useSelector(selectData)?.dishes;

    const [createOrder, { data: createOrderResp }] = useCreateOrderMutation();

    const [page, setPage] = useState(1);
    
    const now = new Date()
    const currentDayTimeInMinutes = now.getHours() * 60 + now.getMinutes() 
    const isDeliveryAvailable = pub?.shipping?.available && (currentDayTimeInMinutes > pub?.shipping?.shipping_work_start && currentDayTimeInMinutes < pub?.shipping?.shipping_work_end)

    const [orderType, setOrderType] = useState(
        pub?.has_in_place_order
            ? orderTypes.inPlace
            : isDeliveryAvailable
            ? orderTypes.delivery
            : null
    );

    useEffect(() => {
        if (orderType) return;
        if (!pub) return;
        const now = new Date()
        const currentDayTimeInMinutes = now.getHours() * 60 + now.getMinutes() 
        const isDeliveryAvailable = pub?.shipping?.available && (currentDayTimeInMinutes > pub?.shipping?.shipping_work_start && currentDayTimeInMinutes < pub?.shipping?.shipping_work_end)

        setOrderType(
            pub?.has_in_place_order
                ? orderTypes.inPlace
                : (isDeliveryAvailable)
                ? orderTypes.delivery
                : null
        );
    }, [orderType, pub]);

    const deliveryPricesMinMax = useMemo(() => {
        if(orderType !== orderTypes.delivery) {
            return {min: 0, max: 0}
        }

        if(!pub?.shipping?.available) {
            return {min: 0, max: 0}
        }

        if(!pub?.shipping?.shipping_prices)
            return {min: 0, max: 0}

        const pricesArray = Object.values(pub?.shipping?.shipping_prices)
        if(pricesArray.length === 0) {
            return {min: 0, max: 0}
        }

        console.log("PRICES", pricesArray)

        const min = pricesArray.reduce( (min, value) => value < min ? value : min , Infinity)
        const max = pricesArray.reduce( (max, value) => value > max ? value : max , 0)

        return {min, max}
    }, [pub, orderType])

    const [comments, setComments] = useState("");
    const [town, setTown] = useState("");
    const [fullAddress, setFullAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [tableNumber, setTableNumber] = useState(1);
    const [paymentType, setPaymentType] = useState(orderPaymentTypes.cash);

    const closePopup = useCallback(() => {
        dispatch(closeCreateOrderPopup());
    }, [dispatch]);

    //On create order success - set last order and clear basket
    useEffect(() => {
        if (!createOrderResp || !createOrderResp.order) {
            return;
        }
        console.log("order Resp: ", createOrderResp);

        const dishPrices = {};
        pubDishes.forEach((item) => {
            dishPrices[item.id] = item.price;
            if (item.sale_price && item.sale_price < item.price) {
                dishPrices[item.id] = item.sale_price;
            }
        });

        let amount = createOrderResp.order.dishes.reduce(
            (acc, dish) => (acc += dishPrices[dish.dish_id] * dish.count),
            0
        );

        if (
            createOrderResp.order.order_type === orderTypes.delivery &&
            +pub?.shipping?.shipping_price
        )
            amount += pub?.shipping?.shipping_price;

        const lastOrder = {
            id: createOrderResp.order.id,
            pub_id: createOrderResp.order.pub_id,
            order_type: createOrderResp.order.order_type,
            created_time: createOrderResp.order.created_time,
            amount: amount,
        };

        dispatch(setLastOrder({ order: lastOrder }));
        dispatch(clearBasket());
        closePopup();
    }, [closePopup, createOrderResp, dispatch, pubDishes]);

    const [isValidatedWithError, setIsValidatedWithError] = useState(false);


    const handleCreateOrderButton = useCallback(() => {
        if (!pub?.real_id) {
            return;
        }


        const dishIDs = Object.keys(basket);
        if (!dishIDs) return;
        const dishesForRequest = dishIDs.map((id) => ({
            dishID: id,
            count: basket[id].count,
        }));

        const order = {
            town: town,
            comments: comments,
            fullAddress: fullAddress,
            tableNumber: tableNumber,
            mainPhoneNumber: phone,
            paymentType: paymentType,
            pubID: pub.real_id,
            dishes: dishesForRequest,
            orderType: orderType,
        };

        const validationErrors = validateOrder(order)
        if(validationErrors && validationErrors.length > 0)
        {
            setIsValidatedWithError(true)
            return;
        }

        console.log("createOdrer", order);
        createOrder({ order });
    }, [
        basket,
        comments,
        createOrder,
        fullAddress,
        orderType,
        paymentType,
        phone,
        pub?.real_id,
        tableNumber,
        town,
    ]);

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl  mb-6">
                        {t("client.popups.create_order.headline")}
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <div className="overflow-hidden relative flex flex-col gap-10">
                        <SelectOrderTypePage
                            shippingWorkHours={{
                                start: pub?.shipping?.shipping_work_start,
                                end: pub?.shipping?.shipping_work_end,
                            }}
                            hasDelivery={pub?.shipping?.available}
                            hasInPlaceOrder={pub?.has_in_place_order}
                            orderType={orderType}
                            setOrderType={setOrderType}
                        />
                        {orderType == orderTypes.inPlace && (
                            <TableNumberInput
                                tableNumber={tableNumber}
                                setTableNumber={setTableNumber}
                            />
                        )}

                        {orderType == orderTypes.delivery && (
                            <AddressAndPhoneInputs
                                fullAddress={fullAddress}
                                setFullAddress={setFullAddress}
                                town={town}
                                setTown={setTown}
                                phone={phone}
                                setPhone={setPhone}
                                isValidatedOutside={isValidatedWithError}
                            />
                        )}
                        <CreateOrderPage
                        orderType={orderType}
                            deliveryPriceMin={
                                deliveryPricesMinMax.min
                            }
                            deliveryPriceMax={
                                deliveryPricesMinMax.max
                            }
                            comments={comments}
                            setComments={setComments}
                            createOrder={handleCreateOrderButton}
                        />
                    </div>
                </main>
            </div>
        </Popup>
    );
};

export default CreateOrderPopup;
