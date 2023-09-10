"use client"
import { useContext } from "react";
import { ThemeContext } from "../PubPage/PubPage";
import BasketList from "./BasketList"

const BasketPage = ({data}) => {
    const themeContext = useContext(ThemeContext);
  return (
    <>
        {data?.pub && 
            <div>
                <h1 className="block text-center text-2xl font-bold mb-8 mt-2" style={{color: themeContext.textColor}}>Basket</h1>
                <BasketList allDishes={data.dishes} currencyID={data.pub.currencyID}/>
            </div>
        }
    </>
  )
}

export default BasketPage