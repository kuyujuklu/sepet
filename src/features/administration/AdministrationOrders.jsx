import { useEffect, useMemo, useState } from "react"
import { useCheckAdminQuery } from "../../api/company/company"
import { useGetAllOrdersQuery, useLazyGetPubRefreshTokenQuery } from "../../api/admin/admin"
import OrderCard from "../admin/Orders/OrderCard"
import { useNavigate, useNavigation } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setaccesstoken } from "../../api/auth/authBasedQuery"
import { requireAuthentication } from "../auth/authSlice"

const AdministrationOrders = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()  

    const {data: ordersData, error: ordersError} = useGetAllOrdersQuery({status: "in-process"})

    const [getPubToken, {data: getPubTokenData, error: getPubError}] = useLazyGetPubRefreshTokenQuery()
    const [selectedPubID, setSelectedPubID] = useState()
    const handleClick = (pubID) =>{ 
      setSelectedPubID(pubID)
      getPubToken({pubID: pubID})
    }
  
    useEffect(() => {
      if(!getPubTokenData) return;
      if(getPubTokenData && getPubTokenData.ok === true) {
        setaccesstoken("")
        navigate(`/admin/pub/${selectedPubID}/orders`)
      }
    }, [dispatch, getPubTokenData, navigate, selectedPubID])

    return (
    <div className="flex flex-col gap-5 items-center py-10">
      {ordersData?.orders.map((order)=> <button onClick={() => handleClick(order.pub_id)}><OrderCard order={order}/></button>)}
    </div>
  )
}

export default AdministrationOrders
