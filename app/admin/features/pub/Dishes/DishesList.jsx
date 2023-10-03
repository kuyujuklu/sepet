"use client"
import { useGetDishesQuery } from "@/app/admin/api/dish/dish"
import { useEffect } from "react"
import AddDishButton from "./AddDishButton"
import Dish from "./Dish"
import { useDispatch } from "react-redux"
import { errorKeys, setReceivingError } from "../../errorHandlers/errorHandlerSlice"

const DishesList = ({companyID, pubID, menuID, categoryID}) => {
    const {data: dishesData, error} = useGetDishesQuery({companyID, pubID, menuID, categoryID})
    const dispatch = useDispatch()

    useEffect(() => {
        if(!error) return;

        dispatch(setReceivingError({errorKey: errorKeys.get_dishes, error}))
    }, [dispatch, error])

    return (
        <div>
            <AddDishButton categoryID={categoryID} menuID={menuID}/>
            <div className="mt-6 flex flex-col gap-4">
                {dishesData?.dishes?.toSorted((a, b) => a.place - b.place).map((dish) => (
                    <Dish key={dish.id} dish={dish} categoryID={categoryID} menuID={menuID} />
                ))}
            </div>
        </div>
  )
}

export default DishesList