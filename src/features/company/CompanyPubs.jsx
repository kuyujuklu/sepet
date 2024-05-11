"use client"
import { useGetPubsQuery } from "../../api/pub/pub"
import AddPub from "./AddPub"
import CompanyPub from "./CompanyPub"

const CompanyPubs = ({companyID}) => {
  
  const {data} = useGetPubsQuery({companyID})

  return (
    <div className="flex flex-wrap justify-center gap-2">
        { 
          data?.pubs?.map((pub) => (<CompanyPub key={pub.id} pub={pub}/>))
        }
        <AddPub />
    </div>
  )
}

export default CompanyPubs