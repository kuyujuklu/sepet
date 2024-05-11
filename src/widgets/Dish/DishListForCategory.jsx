import { useEffect, useState } from "react";
import DishList from "./DishList";
import { useGetPubInfoQuery } from "../../shared/api/pubs/pubsApi";

const DishListForCategory = ({ pubID, categoryID }) => {
  const { data: pubData, error: pubError } = useGetPubInfoQuery(
    { pubID },
    { skip: !pubID }
  );

  const [shownDishes, setShownDishes] = useState([]);


  useEffect(() => {
    if (!categoryID) return;

    const filteredDishes = pubData?.dishes
    //   .filter((dish) => dish?.visible)
      .filter((dish) => dish?.category_id === categoryID);

    setShownDishes(filteredDishes);
  }, [pubData, categoryID]);


  return <DishList dishes={shownDishes} pubID={pubID} pub={pubData?.pub}/>;
};

export default DishListForCategory;
