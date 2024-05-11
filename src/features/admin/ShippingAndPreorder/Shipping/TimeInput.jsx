import { useSetShippingTimeMutation } from "@/api/pub/pub";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import { useTranslation } from "react-i18next";

const TimeInput = ({pubID, companyID, shipping_time_from, shipping_time_to}) => {
  const {t} = useTranslation()
  const [from, setFrom] = useState(0);
    const [to, setTo] = useState(0);

    useEffect(() => {
      if(!shipping_time_from || !shipping_time_to) return;
      
      setFrom(shipping_time_from)
      setTo(shipping_time_to)
    }, [shipping_time_from, shipping_time_to])

    const [setShippingTime, {isLoading}] = useSetShippingTimeMutation({fixedCacheKey: fixedCacheKeys.pubs.set_shipping_time})

    const saveInputs = () => {
      if(!(+from) || !(+to)) {
        return;
      }

      setShippingTime({companyID, pubID, from, to})
    }

    return (
        <div>
            <div className="font-medium text-lg">{t("admin.admin_panel.shipping.shipping_time.label")}</div>
            <div className="gap-2 flex items-center">
                <span>{t("admin.admin_panel.shipping.shipping_time.from")}</span>
                <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                    placeholder="min"
                    style={{ width: 50, height: 20 }}
                    className="px-2 py-2 border border-gray-400 shadow-2xl rounded-md text-gray-600"
                ></input>
                <span>- {t("admin.admin_panel.shipping.shipping_time.to")}</span>
                <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                    placeholder="min"
                    style={{ width: 50, height: 20 }}
                    className="px-2 py-2 border border-gray-400 shadow-2xl rounded-md text-gray-600"
                ></input>
                { (from && to && (from !== shipping_time_from || to !== shipping_time_to)) && 
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
        </div>
    );
};

export default TimeInput;
