"use client"
import DishesUpper from "./DishesUpper"
import DishesList from "./DishesList"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { selectMenuID } from "@/app/[locale]/pub/store/menuSlice"
import { useRouter } from "next/navigation"
import { useTranslation } from "react-i18next"

const Dishes = ({dishes, category, pub}) => {
  const router = useRouter()
  const categoryMenuID = category?.menu_id
  const stateMenuID = useSelector(selectMenuID)
  const {i18n} = useTranslation()
  useEffect(() => {
    if(stateMenuID !== categoryMenuID) {
      router.push(`/${i18n.language}/pub/${pub?.id}/`)
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