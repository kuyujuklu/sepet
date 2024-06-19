import { Button } from "@mui/material"
import { useEffect, useState } from "react"
import BlackSpinner from "../../../../components/loaders/BlackSpinner"
import { useTranslation } from "react-i18next"
import { useSetShippingPriceMutation } from "../../../../api/pub/pub"

const DeliveryPriceInput = ({companyID, pubID, deliveryPrice}) => {
  const {t} = useTranslation()
    const [localDeliveryPrice, setLocalDeliveryPrice] = useState(deliveryPrice)
  const [setDeliveryPrice, {data, error, isLoading}] = useSetShippingPriceMutation()

  useEffect(() => {
    if(!deliveryPrice) return;
    setLocalDeliveryPrice(deliveryPrice)
  }, [deliveryPrice])

  const saveInputs = () => {
    setDeliveryPrice({companyID, pubID, price: localDeliveryPrice})
  }  

  return (
    <div>
        <input
            value={localDeliveryPrice}
            onChange={(e) => setLocalDeliveryPrice(e.target.value)}
            placeholder={t("admin.admin_panel.shipping.shipping_price.input_placeholder")}
            style={{ width: 70, height: 20 }}
            className="px-2 py-2 border border-gray-400 shadow-2xl rounded-md text-gray-600"
        ></input>
        {" "}
        <span className="mr-3">Lei</span>        
        { (+deliveryPrice !== +localDeliveryPrice) &&    
            <Button
                    variant="contained"
                    sx={{
                        color: "white",
                        bgcolor: "#3b82f6",
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        padding: ".2rem 1rem",
                        borderRadius: "10px",
                        width: "fit-content%",
                        ":hover": {
                            bgcolor: "#2563eb",
                        },
                    }}
                    onClick={saveInputs}
                >
                    <span>{isLoading ?  <BlackSpinner /> : t("admin.admin_panel.shipping.shipping_time.save") }</span>
                </Button>
          }
    </div>
  )
}

export default DeliveryPriceInput