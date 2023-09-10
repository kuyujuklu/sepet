import Dish from "./Dish"

const DishesList = ({dishes, categoryID, currencyID}) => {
    const showedSortedDishes = dishes?.toSorted((a, b) => a.place - b.place).filter((dish) => dish.category_id === categoryID && dish.visible)
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