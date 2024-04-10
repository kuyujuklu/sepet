import RightArrowBlack from "@/public/images/svg/arrow-right-black.svg"
import { ConvertQrMenuApiTimeToLocal } from "@/app/utils/time"
import Image from "next/image"
import { orderStatuses } from "@/app/admin/static-data/data"

const OrderCard = ({order, hasArrow = true}) => {
  
  return (
    <div className="flex flex-wrap justify-between gap-x-10 rounded-2xl shadow-xl border-gray-300 border px-10 py-5" style={{maxWidth: "900px", borderColor: order.status === orderStatuses.completed ? "#d1d5dB" : "#059669"}}>
        <div className="font-bold">
          Order №{order?.id}
        </div>
        <div className="" >
          {order?.client_name}
        </div>
        <div className="flex gap-x-10">
          {ConvertQrMenuApiTimeToLocal(order?.created_time)}
        {hasArrow && 
          <Image 
              src={RightArrowBlack}
              width={23}
              height={23}
              alt="right arrow"
          />
        }
        </div>
    </div>
  )
}

export default OrderCard