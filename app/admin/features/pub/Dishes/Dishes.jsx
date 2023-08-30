import { useParams } from "react-router-dom"
import DishesUpper from "./DishesUpper"
import { useGetCategoryQuery } from "@/app/admin/api/categories/category"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectCompanyID } from "../../company/companySlice"
import DishesList from "./DishesList"
import { requireAuthentication } from "../../auth/authSlice"

const Dishes = () => {
    const dispatch = useDispatch()
    const pathParams = useParams()
    const companyID = useSelector(selectCompanyID)
    const pubID = pathParams.pubID
    const menuID = pathParams.menuID
    const categoryID = pathParams.categoryID

    const {data: categoryData, error} = useGetCategoryQuery({companyID, pubID, menuID, categoryID})
    useEffect(() => {
      if (error && error.text === error.unauthorized) {
          dispatch(requireAuthentication())
      }
    }, [dispatch, error])
    
  return (
    <div>
        <div className="mb-4">
          <DishesUpper pubID={pubID} categoryName={categoryData?.category?.name} />
        </div>
        <DishesList companyID={companyID} pubID={pubID} menuID={menuID} categoryID={categoryID} />
    </div>
  )
}

export default Dishes