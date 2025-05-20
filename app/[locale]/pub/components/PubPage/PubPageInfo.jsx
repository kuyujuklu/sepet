import SwitchLang from "../DownPanel/SwitchLang";
import { getPubWorkHours } from "../../../../utils/pub";

const PubPageInfo = ({ pub, textColor, pubColor, t }) => {
  const pubWorkHours = getPubWorkHours(pub)
  const shippingWorkHours = { start: pubWorkHours.shippingWorkStart, end: pubWorkHours.shippingWorkEnd }

  const startRoundedHours = parseInt(shippingWorkHours.start / 60);
  const startRoundedMinutes = parseInt(shippingWorkHours.start % 60);
  const endRoundedHours = parseInt(shippingWorkHours.end / 60);
  const endRoundedMinutes = parseInt(shippingWorkHours.end % 60);
  const shippingTimeString = `${
    startRoundedHours > 9 ? startRoundedHours : "0" + startRoundedHours
    }:${
    startRoundedMinutes > 9
      ? startRoundedMinutes
      : "0" + startRoundedMinutes
    } -   
    ${endRoundedHours > 9 ? endRoundedHours : "0" + endRoundedHours}:${
    endRoundedMinutes > 9 ? endRoundedMinutes : "0" + endRoundedMinutes
    }`;

  return (
    <div style={{ color: pubColor }}>
      <header className="flex justify-between">
        <h1 className="text-3xl font-bold mb-4" style={{ color: textColor }}>{pub.name}</h1>
        <div className="px-5">
          <SwitchLang pubUrlName={pub?.url_name} />
        </div>
      </header>
      <div className="flex items-center gap-y justify-between flex-wrap text-sm sm:text-base">
        {
          pub.wifi_password &&
          <div style={{ width: "100%" }} className="flex gap-2">
            <span>{t("client.pub_info.wifi_password")}: </span>
            <span>{pub.wifi_password}</span>
          </div>
        }
        {
          pub.address &&
          <div style={{ width: "100%" }} className="flex items-center gap-2">
            <span>{t("client.pub_info.address")}: </span>
            <span>{pub.address}</span>
          </div>
        }
        {
          !!pub.shipping.shipping_work_start &&
          <div style={{ width: "100%" }} className="flex flex-wrap gap-x-2 mt-2">
            <span>{t("client.pub_info.work_hours")}: </span>
            <span>{shippingTimeString}</span>
          </div>
        }
        {
          pub.additional_info &&
          <div style={{ width: "100%" }} className="flex flex-wrap gap-x-2 mt-2">
            <span>{t("client.pub_info.additional_info")}: </span>
            <span>{pub.additional_info}</span>
          </div>
        }
      </div>
    </div>
  );
};

export default PubPageInfo;
