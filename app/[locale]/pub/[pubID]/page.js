"use client"

import { useSelector } from "react-redux";
import MenuSections from "../components/PubPage/Categories/MenuSections";
import { selectData } from "../store/pubInfoSlice";

const PubPage = () => {
  const data = useSelector(selectData)
  return (
    <div>
      {data &&
        <MenuSections menus={data.menus} categories={data.categories} dishes={data.dishes} pub={data.pub} />
      }
    </div>
  )
}

export default PubPage
