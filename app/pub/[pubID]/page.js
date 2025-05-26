"use client"

import Categories from "@/app/[locale]/pub/components/PubPage/Categories/Categories"
import { selectData } from "@/app/[locale]/pub/store/pubInfoSlice"
import { useSelector } from "react-redux"
import { useEffect } from "react"


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
