import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import {
    closeCreateOrderPopup,
    selectCreateOrderPopupState,
} from "../../store/orderSlice";
import { useCreateOrderMutation } from "../../api/rtk-query/orders";
import { useCallback, useEffect, useState } from "react";
import Popup from "@/app/shared-components/Popup/Popup";
import SelectOrderTypePage from "./CreateOrderPopupPages/SelectOrderTypePage";
import { orderPaymentTypes, orderTypes } from "@/app/static-data/data";
import { Button } from "@mui/material";
import TableNumberInput from "./CreateOrderPopupPages/TableNumberInput";
import AddressAndPhoneInputs from "./CreateOrderPopupPages/AddressAndPhoneInputs";
import SelectPaymentType from "./CreateOrderPopupPages/SelectPaymentType";
import CreateOrderPage from "./CreateOrderPopupPages/CreateOrderPage";
import { selectData } from "../../store/pubInfoSlice";
import { validateOrderByPage } from "./validators";
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

    const [
        createOrder,
        { data: createOrderResp, isLoading, error: createOrderError },
    ] = useCreateOrderMutation();

    const [page, setPage] = useState(1);
    const [orderType, setOrderType] = useState(orderTypes.inPlace);
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

        const amount = createOrderResp.order.dishes.reduce(
            (acc, dish) => (acc += dishPrices[dish.dish_id] * dish.count),
            0
        );

        const lastOrder = {
            id: createOrderResp.order.id,
            pub_id: createOrderResp.order.pub_id,
            order_type: createOrderResp.order.order_type,
            created_time: createOrderResp.order.created_time,
            amount: amount
        };
        dispatch(setLastOrder({order: lastOrder}))
        dispatch(clearBasket());
        closePopup();
    }, [closePopup, createOrderResp, dispatch, pubDishes]);

    const maxPage = orderType === orderTypes.inPlace ? 3 : 4;
    const minPage = 1;

    const [isValidatedWithError, setIsValidatedWithError] = useState(false);

    const canGoToNextPage = useCallback(() => {
        const order = {
            town: town,
            comments: comments,
            fullAddress: fullAddress,
            tableNumber: tableNumber,
            mainPhoneNumber: phone,
            paymentType: paymentType,
            orderType: orderType,
        };
        let error = validateOrderByPage(order, page);
        if (error) setIsValidatedWithError(true);
        return !error;
    }, [
        town,
        comments,
        fullAddress,
        tableNumber,
        phone,
        paymentType,
        orderType,
        page,
    ]);

    const goToNextPage = () => {
        if (!canGoToNextPage()) return;
        if (page >= maxPage) return;
        const newPage = page + 1;

        setPage(newPage);
    };
    const goToPrevPage = () => {
        if (page <= minPage) return;
        setPage((prev) => prev - 1);
    };

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
                    <div className="overflow-hidden relative">
                        <div
                            className="relative flex"
                            style={{
                                left: -(page - 1) * 100 + "%",
                                transition: "all .3s ease",
                            }}
                        >
                            {/* FIRST PAGE */}
                            <div
                                style={{ minWidth: "100%", maxWidth: "100%" }}
                                className="flex items-center px-2"
                            >
                                <SelectOrderTypePage
                                    orderType={orderType}
                                    setOrderType={setOrderType}
                                />
                            </div>
                            {/* SECOND PAGE */}
                            <div
                                style={{ minWidth: "100%", maxWidth: "100%" }}
                                className="flex items-center px-2"
                            >
                                {orderType === orderTypes.inPlace && (
                                    <div className="w-full">
                                        <TableNumberInput
                                            tableNumber={tableNumber}
                                            setTableNumber={setTableNumber}
                                        />
                                    </div>
                                )}
                                {orderType === orderTypes.delivery && (
                                    <div className="w-full">
                                        <AddressAndPhoneInputs
                                            fullAddress={fullAddress}
                                            setFullAddress={setFullAddress}
                                            town={town}
                                            setTown={setTown}
                                            phone={phone}
                                            setPhone={setPhone}
                                            isValidatedOutside={
                                                isValidatedWithError
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            {/* THIRD PAGE */}
                            <div
                                style={{ minWidth: "100%", maxWidth: "100%" }}
                                className="flex items-center px-2"
                            >
                                {orderType === orderTypes.inPlace && (
                                    <CreateOrderPage
                                        comments={comments}
                                        setComments={setComments}
                                        createOrder={handleCreateOrderButton}
                                    />
                                )}
                                {orderType === orderTypes.delivery && (
                                    <SelectPaymentType
                                        paymentType={paymentType}
                                        setPaymentType={setPaymentType}
                                    />
                                )}
                            </div>

                            {/* FOURTH PAGE */}
                            <div
                                style={{ minWidth: "100%", maxWidth: "100%" }}
                                className="flex items-center px-2"
                            >
                                {orderType === orderTypes.delivery && (
                                    <CreateOrderPage
                                        comments={comments}
                                        setComments={setComments}
                                        createOrder={handleCreateOrderButton}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="flex gap-x-5">
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor:
                                page <= minPage
                                    ? "rgb(55 65 81)"
                                    : "rgb(17 24 39)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".4rem .5rem",
                            borderRadius: "10px",
                            width: "30%",
                            ":hover": {
                                bgcolor:
                                    page <= minPage
                                        ? "rgb(55 65 81)"
                                        : "rgb(17 24 39)",
                            },
                        }}
                        onClick={goToPrevPage}
                    >
                        {t("client.popups.create_order.back")}
                    </Button>
                    {page < maxPage && (
                        <Button
                            variant="contained"
                            sx={{
                                color: "white",
                                bgcolor:
                                    page >= maxPage
                                        ? "rgb(55 65 81)"
                                        : "rgb(17 24 39)",
                                fontSize: ".7rem",
                                fontWeight: "medium",
                                padding: ".4rem .5rem",
                                borderRadius: "10px",
                                width: "30%",
                                ":hover": {
                                    bgcolor:
                                        page >= maxPage
                                            ? "rgb(55 65 81)"
                                            : "rgb(17 24 39)",
                                },
                            }}
                            onClick={goToNextPage}
                        >
                            {t("client.popups.create_order.next")}
                        </Button>
                    )}
                </footer>
            </div>
        </Popup>
    );
};

export default CreateOrderPopup;
