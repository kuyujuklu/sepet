import { useSetShippingTimeMutation } from "@/api/pub/pub";
import { useEffect, useState } from "react";
import BlackSpinner from "@/components/loaders/BlackSpinner";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import { useTranslation } from "react-i18next";

const TimeInput = ({pubID, companyID, shipping_time_from, shipping_time_to}) => {
  const {t, i18n} = useTranslation()
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
        <div className="flex flex-col gap-2.5">
            <div className="text-[12px] font-semibold tracking-wide uppercase text-muted-2">
                {t("admin.admin_panel.shipping.shipping_time.label")}
            </div>
            <div className="gap-2 flex items-center flex-wrap">
                <span className="text-[13.5px] text-muted">{t("admin.admin_panel.shipping.shipping_time.from")}</span>
                <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                    placeholder="min"
                    style={{ width: 56, height: 32, borderColor: "#cfe0f5", borderWidth: 1.5 }}
                    className="px-2 rounded-lg text-[13.5px] font-semibold text-ink"
                ></input>
                <span className="text-[13px] text-muted">{i18n.language === "ru" ? "мин" : "min"}</span>
                <span className="text-[13.5px] text-muted">{t("admin.admin_panel.shipping.shipping_time.to")}</span>
                <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                    placeholder="min"
                    style={{ width: 56, height: 32, borderColor: "#cfe0f5", borderWidth: 1.5 }}
                    className="px-2 rounded-lg text-[13.5px] font-semibold text-ink"
                ></input>
                <span className="text-[13px] text-muted">{i18n.language === "ru" ? "мин" : "min"}</span>
                { (from && to && (from !== shipping_time_from || to !== shipping_time_to)) &&
                  (isLoading ? <BlackSpinner /> : (
                    <button
                      className="text-[12.5px] font-semibold"
                      style={{ color: "#2D7DD2" }}
                      onClick={saveInputs}
                    >
                      {t("admin.admin_panel.shipping.shipping_time.save")}
                    </button>
                  ))
                }
            </div>
        </div>
    );
};

export default TimeInput;
