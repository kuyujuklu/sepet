"use client";
import Dishes from "@/app/pub/components/PubPage/Dishes/Dishes";
import { selectData } from "@/app/pub/store/pubInfoSlice";
import { useSelector } from "react-redux";

const Page = ({ params }) => {
    const data = useSelector(selectData)
    const categoryID = params.categoryID;
    const category = data?.categories?.find(
        (category) => category.id === +categoryID ?? -1
    );

    return (
        <>
        {data && 
            <div className="mt-4">
                <Dishes
                    dishes={data?.dishes}
                    menuID={category?.menuID}
                    category={category}
                    pub={data?.pub}
                />
            </div>
        }
        </>
    );
};

export default Page;
