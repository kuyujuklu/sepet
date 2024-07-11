"use client"
import { useSelector } from "react-redux";
import BasketPage from "../../components/Basket/BasketPage"
import { selectData } from "../../store/pubInfoSlice";

const Page = () => {
  const data = useSelector(selectData)
  return (
    <>
      {data && 
        <BasketPage data={data}/>
      }
    </>
  )
}

export default Page