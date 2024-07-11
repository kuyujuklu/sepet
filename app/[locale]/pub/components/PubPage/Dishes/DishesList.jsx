import { useMemo } from "react";
import Dish from "./Dish"

const DishesList = ({dishes, categoryID, currencyID}) => {

    const showedSortedDishes = useMemo(() => {
        if(!dishes) return [];
        
        const sortedDishes = [...dishes];
        sortedDishes?.sort((a, b) => a.place - b.place)
        
        return sortedDishes.filter((dish) => {
          return dish.category_id === categoryID && dish.visible
        });
    }, [categoryID, dishes])

    return (
        <div>
            <div className="mt-6 flex flex-col gap-4">
                {showedSortedDishes?.map((dish) => (
                    <Dish key={dish.id} dish={dish} currencyID={currencyID} />
                ))}
            </div>
        </div>
  )
}

export default DishesList