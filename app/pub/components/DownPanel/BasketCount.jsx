import { useSelector } from "react-redux";
import { selectDishes } from "../../store/basketSlice";

const BasketCount = () => {
    const selectedDishes = useSelector(selectDishes);
    const count = Object.keys(selectedDishes)
        .reduce((acc, id) => (acc += selectedDishes[id].count ?? 0), 0);
    console.log("count: ", count);
    return (
        <>
            {count > 0 && (
                <div
                    className="absolute bg-red-600 rounded-full aspect-square text-3xs px-1 flex items-center"
                    style={{
                        top: -5,
                        right: -5,
                    }}
                    width={20}
                    height={20}
                >
                    {count}
                </div>
            )}
        </>
    );
};

export default BasketCount;
