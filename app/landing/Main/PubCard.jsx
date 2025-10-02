import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { getPubWorkHours } from "../../utils/pub";
import { convertMinsToTime } from "../../utils/time";
import Image from "next/image"

const PubCard = ({ pub }) => {
  const [imageIsLoaded, setImageIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setImageIsLoaded(true), 5000)
  }, [])

  const { i18n } = useTranslation()

  const deliveryWorkHours = getPubWorkHours(pub)
  const workStart = convertMinsToTime(deliveryWorkHours.shippingWorkStart)
  const workEnd = convertMinsToTime(deliveryWorkHours.shippingWorkEnd)
  console.log("LSDJFLSDSKDLJF", pub)

  return (
    <Link
      style={{ display: "block", height: "160px", maxWidth: 520, width: "100%" }}
      href={`/${i18n.language ?? "ru"}/pub/${pub?.url_name}`}
    >
      <div
        style={{
          height: "160px",
          width: "100%",
          background: "rgb(17 24 39)",
          color: "#ffffff",
        }}
        className="rounded-2xl relative overflow-hidden"
      >
        {pub?.bg_image_file_name && (
          <img
            onLoad={() => setImageIsLoaded(true)}
            src={`/api-static/images/pubs/bgs/${pub?.bg_image_file_name}`}
            alt="pub_bg"
            style={{
              opacity: 0.55,
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* category center content*/}
        <div
          style={{ zIndex: 20 }}
          className="absolute m-auto inset-0 text-center h-fit w-fit flex flex-col items-center"
        >
          <div
            className="p-4 text-2xl font-medium w-fit m-auto"
            style={{ textShadow: "0px 0px 3px black" }}
          >
            <div className="flex flex-col">
              <div className="flex gap-3 justify-center items-center text-md">
                <div className="">
                  {pub?.name}
                </div>
                {pub?.rating !== 0 &&
                  <div className="flex items-center gap-1">
                    <div className="">
                      {pub?.rating?.toFixed(2)}
                    </div>
                    <div style={{ width: 23, height: 23 }}>
                      <Image width={23} height={23} src="/images/png/star.png" />
                    </div>
                  </div>
                }
              </div>
              <div className="text-sm">
                Цена доставки {pub?.shipping_price.toFixed(2)} Lei
              </div>

              {pub?.shipping_free_delivery_price !== 0 &&
                <div className="text-sm">
                  Бесплатная доставка от {pub?.shipping_free_delivery_price.toFixed(2)} Lei
                </div>
              }
              <div className="text-sm">
                Время работы {workStart + "-" + workEnd}
              </div>
            </div>
            {
              (pub?.bg_image_file_name && !imageIsLoaded) && (<div className="w-full h-full flex pt-3 justify-center">Loading...</div>)
            }
          </div>
        </div>
      </div>
    </Link>

  );
};

export default PubCard;

