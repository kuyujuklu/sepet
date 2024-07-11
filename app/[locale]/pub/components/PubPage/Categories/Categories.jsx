'use client';
import { useSelector } from "react-redux";
import { selectMenuID } from "@/app/[locale]/pub/store/menuSlice";
import Category from "./Category";
import { useMemo } from "react";

const Categories = ({ pubID, categories }) => {
    const menuID = useSelector(selectMenuID);
    

    const showedSortedCategories = useMemo(() => {
    if(!categories) return [];
        
        const sortedCategories = [...categories];
        sortedCategories?.sort((a, b) => a.place - b.place)
        
        return sortedCategories.filter((category) => {
          return category.visible && category.menu_id === menuID
        });
    }, [categories, menuID])


    return (
        <div className="mt-5 flex flex-col gap-4">
            {showedSortedCategories?.map((category) => (
                <Category pubID={pubID} key={category.id} category={category} />
            ))}
        </div>
    );
};

export default Categories;
