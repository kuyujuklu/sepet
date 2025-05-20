import { useContext } from "react";
import { ThemeContext } from "./ThemeContextProvider";
import { useSelector, useDispatch } from "react-redux";
import { selectLocation, openSelectLocationPopup } from "../../store/locationSlice";
import { useTranslation } from "next-i18next";
import { translateLocation } from "../../../../utils/location";

const PubPageUpper = ({ pub }) => {
  const themeContext = useContext(ThemeContext);
  const location = useSelector(selectLocation)
  const dispatch = useDispatch()
  const { i18n, t } = useTranslation()
  console.log("LOCATION: ", location)

  const handleLocationClick = () => {
    dispatch(openSelectLocationPopup())
  }

  return (
    <div
      style={{
        height: "180px",
        width: "100%",
        position: "absolute",
        overflow: "hidden",
      }}
      className=""
      background={themeContext.bgColor}
    >
      {location &&
        <div
          onClick={handleLocationClick}
          style={{
            cursor: "pointer",
            position: "absolute",
            background: themeContext.bgColor,
            color: themeContext.textColor,
            padding: "5px 10px",
            borderRadius: 10,
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
            gap: 5
          }}>
          <span className="flex items-center gap-4"><span>{t("client.pub_info.delivery_to")}:</span><span> {translateLocation(location, i18n.language)}</span></span>
          {
            themeContext.theme === "dark" ?
              <img
                // onLoad={() => setImageIsLoaded(true)}
                src={`/images/svg/arrow-bottom-white.svg`}
                alt="pub-cover"
                style={{
                  display: "block",
                  width: "15px",
                  height: "15px",
                  objectFit: "cover",
                }}
              />
              :
              <img
                // onLoad={() => setImageIsLoaded(true)}
                src={`/images/svg/arrow-bottom-black.svg`}
                alt="pub-cover"
                style={{
                  display: "block",
                  width: "15px",
                  height: "15px",
                  objectFit: "cover",
                }}
              />
          }
        </div>
      }
      {pub.bg_image_file_name && (
        <img
          // onLoad={() => setImageIsLoaded(true)}
          src={`/api-static/images/pubs/bgs/${pub.bg_image_file_name}`}
          alt="pub-cover"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      )}
      {/* {
                pub.bg_image_file_name && !imageIsLoaded && (<div className="w-full h-full flex pt-3 justify-center"><BlackSpinner /></div>)
            } */}
    </div>
  );
};

export default PubPageUpper;
