import Link from "next/link";
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";

const PubCard = ({ pub }) => {
  const [imageIsLoaded, setImageIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setImageIsLoaded(true), 5000)
  }, [])

  const { i18n } = useTranslation()

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
            {pub?.name}
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

