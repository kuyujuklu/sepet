import { useSelector } from "react-redux";
import { selectDishes } from "../../store/basketSlice";
import Dish from "../PubPage/Dishes/Dish";

const BasketList = ({ allDishes, currencyID }) => {
    const selectedDishes = useSelector(selectDishes);
    const selectedIDS = Object.keys(selectedDishes).map(id => +id)
    const shownDishes = 
        allDishes
        .filter(dish => selectedIDS.includes(dish.id))
        .map((dish) => (
            <Dish key={dish.id} dish={dish} currencyID={currencyID} />
        ));
    return <div>{shownDishes}</div>;
};

export default BasketList;
