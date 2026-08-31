import { useMemo } from "react";
import Dish from "./Dish"

// `dishIDs`, when given, overrides `categoryID`-based filtering entirely -
// an explicit, pre-ordered pick (e.g. the "hits and discounts" section)
// rather than "everything in this category, place-sorted".
const DishesList = ({ dishes, categoryID, dishIDs, hitBadgeDishIDs, currencyID, pub }) => {

  const showedSortedDishes = useMemo(() => {
    if (!dishes) return [];

    if (dishIDs) {
      return dishIDs
        .map((id) => dishes.find((dish) => dish.id === id))
        .filter((dish) => dish && dish.visible);
    }

    const sortedDishes = [...dishes];
    sortedDishes?.sort((a, b) => a.place - b.place)

    return sortedDishes.filter((dish) => {
      return dish.category_id === categoryID && dish.visible
    });
  }, [categoryID, dishIDs, dishes])

  return (
    <div>
      <div className="mt-6 flex flex-col gap-4">
        {showedSortedDishes?.map((dish) => (
          <Dish key={dish.id} dish={dish} currencyID={currencyID} pub={pub} isHit={hitBadgeDishIDs?.has(dish.id)} />
        ))}
      </div>
    </div>
  )
}

export default DishesList
