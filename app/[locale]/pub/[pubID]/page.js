"use client"

import { useSelector } from "react-redux";
import Categories from "../components/PubPage/Categories/Categories";
import { selectData } from "../store/pubInfoSlice";

const PubPage = () => {
  const data = useSelector(selectData)
  return (
    <div>
      {data && 
        <Categories pubID={data.pub.id} categories={data.categories} />
      }
    </div>
  )
}

export default PubPage