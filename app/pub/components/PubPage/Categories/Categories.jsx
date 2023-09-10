'use client';
import { useSelector } from "react-redux";
import { selectMenuID } from "@/app/pub/store/menuSlice";
import Category from "./Category";

const Categories = ({ pubID, categories }) => {
    const menuID = useSelector(selectMenuID);
    
    if(!categories) return null;

    const showedSortedCategories = categories
        ?.toSorted((a, b) => a.place - b.place)
        .filter((category) => {
          return category.visible && category.menu_id === menuID
        });

    return (
        <div className="mt-5 flex flex-col gap-4">
            {showedSortedCategories?.map((category) => (
                <Category pubID={pubID} key={category.id} category={category} />
            ))}
        </div>
    );
};

export default Categories;
