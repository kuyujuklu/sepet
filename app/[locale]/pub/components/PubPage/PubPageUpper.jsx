import { useContext, useEffect } from "react";
import { ThemeContext } from "./ThemeContextProvider";
import { useSelector, useDispatch } from "react-redux";
import { selectLocation, openSelectLocationPopup } from "../../store/locationSlice";
import { useTranslation } from "react-i18next";
import { translateLocation } from "../../../../utils/location";

const PubPageUpper = ({ pub }) => {
  const themeContext = useContext(ThemeContext);
  const location = useSelector(selectLocation)
  const dispatch = useDispatch()
  const { i18n, t } = useTranslation()


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
            maxWidth: "40%",
            padding: "5px 10px",
            borderRadius: 10,
            top: 10,
            left: 10,
            display: "flex",
            alignItems: "center",
          }}>
          <span className="flex flex-col items-center ">
            <span>{t("client.pub_info.delivery_to")}:</span>
            <span className="flex gap-2 items-center"> {translateLocation(location, i18n.language)}
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

            </span>
          </span>
        </div>
      }
      <a href={`https://onelink.to/ey3df3`}
        style={{
          cursor: "pointer",
          position: "absolute",
          background: themeContext.bgColor,
          color: themeContext.textColor,
          padding: "5px 10px",
          borderRadius: 10,
          maxWidth: "40%",
          top: 10,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: 5
        }}>
        <span>{t("client.pub_info.open_in_app")}</span>
        {
          //themeContext.theme === "dark" ?
          //  <img
          //    // onLoad={() => setImageIsLoaded(true)}
          //    src={`/images/svg/arrow-bottom-white.svg`}
          //    alt="pub-cover"
          //    style={{
          //      display: "block",
          //      width: "15px",
          //      height: "15px",
          //      objectFit: "cover",
          //    }}
          //  />
          //  :
          //  <img
          //    // onLoad={() => setImageIsLoaded(true)}
          //    src={`/images/svg/arrow-bottom-black.svg`}
          //    alt="pub-cover"
          //    style={{
          //      display: "block",
          //      width: "15px",
          //      height: "15px",
          //      objectFit: "cover",
          //    }}
          //  />
        }
      </a>
      {
        pub.bg_image_file_name && (
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
        )
      }
      {/* {
                pub.bg_image_file_name && !imageIsLoaded && (<div className="w-full h-full flex pt-3 justify-center"><BlackSpinner /></div>)
            } */}
    </div >
  );
};

export default PubPageUpper;
