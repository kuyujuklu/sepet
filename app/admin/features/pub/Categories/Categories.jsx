import { useSelector } from "react-redux"
import { selectMenuID } from "../Menus/menuSlice";
import { selectPubID } from "../pubSlice";
import { selectCompanyID } from "../../company/companySlice";
import { useGetCategoriesQuery } from "@/app/admin/api/categories/category";
import { useContext, useEffect } from "react";
import AddCategoryButton from "./AddCategoryButton";
import { ThemeContext } from "../PubPage";
import Category from "./Category";

const Categories = () => {
    const themeContext = useContext(ThemeContext);
    const companyID = useSelector(selectCompanyID);
    const menuID = useSelector(selectMenuID);
    const pubID = useSelector(selectPubID);


    const {data: categoriesData, error} = useGetCategoriesQuery({companyID: companyID, menuID: menuID, pubID: pubID});
    useEffect(() => {
        if(error) {
          //TODO: handle error
        }
    }, [error])


  return (
    <div style={{
      color: themeContext.textColor
    }}>
      <AddCategoryButton />
      <div className="mt-5 flex flex-col gap-4">
        {
          categoriesData?.categories?.map(category => (
            <Category key={category.id} category={category} />  
          ))
        }
      </div>
    </div>
  )
}

export default Categories