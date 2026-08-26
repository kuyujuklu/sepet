import { useEffect, useState } from "react";
import DishList from "./DishList";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";
import { BigCardsSkeleton } from "../Skeletons/Skeleton";

const DishListForCategory = ({ pubID, categoryID, isPubOpen, isAvailableForDelivery }) => {
  const { data: pubData, error: pubError } = useGetPubInfoQuery(
    { pubID },
    { skip: !pubID },
  );

  const [shownDishes, setShownDishes] = useState([]);

  useEffect(() => {
    if (!categoryID) return;

    const filteredDishes = pubData?.dishes
      //   .filter((dish) => dish?.visible)
      .filter((dish) => dish?.category_id === categoryID && dish.visible);

    setShownDishes(filteredDishes);
  }, [pubData, categoryID]);

  if (!pubData) return <BigCardsSkeleton count={3} />;

  return (
    <DishList
      dishes={shownDishes}
      pubID={pubID}
      pub={pubData?.pub}
      isPubOpen={isPubOpen}
      isAvailableForDelivery={isAvailableForDelivery}
    />
  );
};

export default DishListForCategory;
