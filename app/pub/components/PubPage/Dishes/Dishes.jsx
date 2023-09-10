"use client"
import DishesUpper from "./DishesUpper"
import DishesList from "./DishesList"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { selectMenuID } from "@/app/pub/store/menuSlice"
import { useRouter } from "next/navigation"

const Dishes = ({dishes, category, pub}) => {
  const router = useRouter()
  const categoryMenuID = category?.menu_id
  const stateMenuID = useSelector(selectMenuID)
  useEffect(() => {
    if(stateMenuID !== categoryMenuID) {
      router.push(`/pub/${pub?.id}/`)
    }
  }, [categoryMenuID, pub?.id, router, stateMenuID])
  return (
    <div> 
        <div className="mb-4">
          <DishesUpper pubID={pub?.id} categoryName={category?.name} />
        </div>
        <DishesList dishes={dishes} categoryID={category?.id} currencyID={pub?.currency_id} />
    </div>
  )
}

export default Dishes