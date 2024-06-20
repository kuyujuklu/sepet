import { useDispatch, useSelector } from "react-redux";
import { useGetFullPubInfoQuery } from "../../../../api/pub/pub";
import {
  selectAddDishToOrderPopup,
  setAddDishToOrderPopup,
} from "../ordersSlice";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";
import { useUpdateOrderDishesMutation } from "../../../../api/orders/orders";
import Popup from "../../../../components/Popup/Popup";
import { Button } from "@mui/material";
import WhiteSpinner from "../../../../components/loaders/WhiteSpinner";
import { fixedCacheKeys } from "../../../../api/fixedCacheKeys";
import Input from "../../../../components/Inputs/Input";

const AddDishToOrderPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const popupState = useSelector(selectAddDishToOrderPopup);

  const [
    updateDishesQuery,
    {
      data: updateDishesQueryData,
      error: updateDishesQueryError,
      isLoading: updateDishesQueryIsLoading,
    },
  ] = useUpdateOrderDishesMutation({
    fixedCacheKey: fixedCacheKeys.order.addDishToOrder,
  });

  const {
    data: pubData,
    error: pubError,
    isLoading: isPubDataLoading,
  } = useGetFullPubInfoQuery(
    { pubUrlName: popupState.pubUrlName },
    { skip: !popupState.pubUrlName }
  );

  const [count, setCount] = useState(null);
  const [selectedDishID, setSelectedDishID] = useState(0);

  const closePopup = useCallback(() => {
    dispatch(
      setAddDishToOrderPopup({
        opened: false,
        pubUrlName: null,
        pubID: null,
        companyID: null,
        orderID: null,
        currentDishes: null,
      })
    );
    setCount(null);
    setSelectedDishID(0);
  }, [dispatch]);

  useEffect(() => {
    if (updateDishesQueryData) {
      closePopup();
    }
  }, [closePopup, updateDishesQueryData]);

  const handleButtonClick = () => {
    let pubID = popupState?.pubID;
    let orderID = popupState?.orderID;
    let companyID = popupState?.companyID;

    const intCount = +count
    if (
      !companyID ||
      !orderID ||
      !pubID ||
      !popupState?.currentDishes ||
      !selectedDishID ||
      !intCount
    ) {
      console.log("NOT VALID DATA");
      return;
    }

    const newDishes = [...popupState.currentDishes];


    const index = newDishes.findIndex((item) => item.dish_id === selectedDishID)
    if(index === -1) {
        newDishes.push({ dish_id: selectedDishID, count: intCount });
    } else {
        newDishes[index] = {
            dish_id: newDishes[index].dish_id,
            count: newDishes[index].count + intCount,
        }
    }


    updateDishesQuery({ orderID, pubID, companyID, dishes: newDishes });
  };

  return (
    <Popup opened={popupState.opened} closeCallback={closePopup}>
      <div className="py-4">
        <header>
          <h1 className="font-bold text-center text-xl mb-10">
            SelectDishToAdd
          </h1>
        </header>
        <main className="mb-10">
          <div className="flex flex-col gap-4">
            {pubData?.dishes?.map((dish) => (
              <div
                onClick={() => {
                  setSelectedDishID(dish.id);
                  if (!+count) {
                    setCount(1);
                  }
                }}
              >
                <Dish dish={dish} isSelected={dish.id === selectedDishID} />
              </div>
            ))}
          </div>
        </main>
        <footer className="flex gap-10 justify-start text-center">
          {count !== null && selectedDishID && (
            <>
              <Input
                style={{ maxWidth: 100 }}
                value={count}
                setValue={setCount}
                type="number"
              />
              <Button
                disabled={!count || !selectedDishID}
                variant="contained"
                sx={{
                  color: "white",
                  bgcolor: count ? "#3b82f6" : "gray",
                  fontSize: ".7rem",
                  fontWeight: "medium",
                  padding: ".2rem 1rem",
                  borderRadius: "10px",
                  width: "fit-content%",
                  ":hover": {
                    bgcolor: count ? "#2563eb" : "gray",
                  },
                }}
                onClick={handleButtonClick}
              >
                <span>Add dish</span>
              </Button>
            </>
          )}
        </footer>
      </div>
    </Popup>
  );
};

const Dish = ({ dish, isSelected }) => {
  const lowestPrice =
    dish.sale_price && dish.sale_price < dish.price
      ? dish.sale_price
      : dish.price;
  return (
    <div
      className={`flex justify-between border rounded-xl px-5 py-3 cursor-pointer transition-all hover:bg-gray-300 ${
        isSelected ? "bg-gray-300" : ""
      }`}
    >
      <span>{dish.name}</span>
      <div className="flex gap-5">
        {lowestPrice < dish.price && (
          <span className="text-red-600 line-through">{dish.price} Lei</span>
        )}
        <span>{lowestPrice} Lei</span>
      </div>
    </div>
  );
};

export default AddDishToOrderPopup;
