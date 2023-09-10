import { useContext } from "react";
import { ThemeContext } from "../PubPage";

const DishesUpper = ({ categoryName }) => {
    const themeContext = useContext(ThemeContext);

    return (
        <div className="flex items-center flex-wrap-reverse gap-6">
            <div
                style={{ color: themeContext.textColor }}
                className="text-2xl"
            >
                {categoryName}
            </div>
        </div>
    );
};

export default DishesUpper;
