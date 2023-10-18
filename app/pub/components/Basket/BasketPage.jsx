"use client"
import { useContext, useEffect } from "react";
import { ThemeContext } from "../PubPage/PubPage";
import BasketList from "./BasketList"
import Image from "next/image";
import { useDispatch } from "react-redux";
import { clearBasket, setBasketPubID } from "../../store/basketSlice";

const BasketPage = ({data}) => {
    const dispatch = useDispatch();  
  const themeContext = useContext(ThemeContext);

    const handleClearClick = () => {
        dispatch(clearBasket())
    }

    useEffect(() => {
      if(!data || !data.pub) {
          return
      }

      dispatch(setBasketPubID(data.pub.id))
    }, [data, dispatch])

    return (
    <>
        {data?.pub && 
            <div>
              <div className="flex items-center mb-8 mt-2">
                <h1 className="w-full block text-center text-2xl font-bold " style={{color: themeContext.textColor}}>Basket</h1>
                <Image 
                  className="cursor-pointer"
                  onClick={handleClearClick}
                  src={`/images/svg/trash-can-${themeContext.theme === "dark" ? "white": "black"}.svg`} 
                  alt="add" width={30} height={30} />
              </div>
                <BasketList allDishes={data.dishes} currencyID={data.pub.currencyID}/>
            </div>
        }
    </>
  )
}

export default BasketPage