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
import { selectData, selectIsPubInNearbyPubs } from "../../store/pubInfoSlice";
import { validateOrder } from "./validators";
import {
  clearBasket,
  selectDishes,
  setLastOrder,
} from "../../store/basketSlice";
import { getPubWorkHours, countCommissionForPub } from "../../../../utils/pub";
import { selectLocation } from "../../store/locationSlice";
import { addCommissionToPrice } from "../../../../utils/dish";
import { deliveryTypes } from "../../../../static-data/data";
import { getLatLngForLocation } from "../../../../utils/location";

const CreateOrderPopup = () => {
  const { t } = useTranslation();
  const location = useSelector(selectLocation)
  const dispatch = useDispatch();
  const popupState = useSelector(selectCreateOrderPopupState);
  const basket = useSelector(selectDishes);
  const pub = useSelector(selectData)?.pub;
  const pubDishes = useSelector(selectData)?.dishes;

  const [createOrder, { data: createOrderResp }] = useCreateOrderMutation();

  const pubWorkHours = getPubWorkHours(pub)
  const isDeliveryAvailable = pubWorkHours.isDeliveryAvailable



  const [orderType, setOrderType] = useState(
    isDeliveryAvailable
      ? orderTypes.delivery
      : null
  );

  useEffect(() => {
    if (orderType) return;
    if (!pub) return;

    const pubWorkHours = getPubWorkHours(pub)
    const isDeliveryAvailable = pubWorkHours.isDeliveryAvailable

    setOrderType(
      (isDeliveryAvailable)
        ? orderTypes.delivery
        : null
    );
  }, [orderType, pub]);

  const deliveryPrice = useMemo(() => {
    console.log("SHIPPING PRICE: ", pub)


    if (orderType === orderTypes.delivery)
      return pub?.shipping_price
    return 0
  }, [pub, orderType])

  const productPrice = useMemo(() => {
    if (!pubDishes) return;

    const dishIDs = Object.keys(basket);
    if (!dishIDs || dishIDs.length === 0)
      return "no dishes found in basket";


    const prices = {};

    pubDishes.forEach((dish) => {
      prices[dish.id] = dish.price;
      if (dish.sale_price && dish.sale_price < dish.price) {
        prices[dish.id] = dish.sale_price;
      }
    });


    let amount = 0;

    for (let dishID of dishIDs) {
      if (prices[dishID]) amount += prices[dishID] * basket[dishID].count;
      else return "unable to count price please reload page";
    }

    const commission = countCommissionForPub(pub)

    return addCommissionToPrice(amount, commission);

  }, [basket, pubDishes, pub]);


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

    const commission = countCommissionForPub(createOrderResp.order.pub)
    amount = addCommissionToPrice(amount, commission)

    if (
      createOrderResp.order.order_type === orderTypes.delivery &&
      +pub?.shipping_price
    ) {
      amount += pub?.shipping_price;
    }


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

    if (!location) {
      return;
    }

    let { lat, lng } = getLatLngForLocation(location)
    if (!lat || !lng) {
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
      lat,
      lng
    };

    const validationErrors = validateOrder(order)
    if (validationErrors && validationErrors.length > 0) {
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
            {
              //<SelectOrderTypePage
              //  shippingWorkHours={{
              //    start: pubWorkHours.shippingWorkStart,
              //    end: pubWorkHours.shippingWorkEnd,
              //  }}
              //  hasDelivery={pub?.shipping?.available}
              //  hasInPlaceOrder={}
              //  orderType={orderType}
              //  setOrderType={setOrderType}
              ///>
            }

            {
              //
              //  orderType == orderTypes.inPlace && (
              //  <TableNumberInput
              //    tableNumber={tableNumber}
              //    setTableNumber={setTableNumber}
              //  />
              //)
            }

            {orderType == orderTypes.delivery && (
              <AddressAndPhoneInputs
                fullAddress={fullAddress}
                setFullAddress={setFullAddress}
                town={town}
                setTown={setTown}
                phone={phone}
                setPhone={setPhone}
                isValidatedOutside={isValidatedWithError}
                isDeliveryAvailable={isDeliveryAvailable}
              />
            )}
            <CreateOrderPage
              isDeliveryAvailable={isDeliveryAvailable}
              orderType={orderType}
              deliveryPrice={deliveryPrice}
              productPrice={productPrice}
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
