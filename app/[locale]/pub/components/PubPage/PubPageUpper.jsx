import { useContext, useState } from "react";
import Image from "next/image";
import { ThemeContext } from "./ThemeContextProvider";
import { useRouter } from "next/navigation";

// The "delivery to" pill used to duplicate what the home page and the
// basket page already show - removed per direct feedback, back button is
// the only thing this banner needs to surface.
const PubPageUpper = ({ pub, backHref }) => {
  const themeContext = useContext(ThemeContext);
  const router = useRouter()
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <div
      style={{
        height: "180px",
        width: "100%",
        position: "absolute",
        overflow: "hidden",
      }}
      background={themeContext.bgColor}
    >
      {backHref && (
        <button
          onClick={() => router.push(backHref)}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 20,
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "rgba(18,24,31,0.35)",
            backdropFilter: "blur(2px)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        </button>
      )}
      {pub.bg_image_file_name ? (
        <Image
          src={`/api-static/images/pubs/bgs/${pub.bg_image_file_name}`}
          alt={pub.name}
          fill
          sizes="(max-width: 600px) 100vw, 600px"
          style={{ objectFit: "cover", opacity: isImageLoaded ? 1 : 0, transition: "opacity 320ms ease" }}
          onLoad={() => setIsImageLoaded(true)}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#123527" }} />
      )}
    </div>
  );
};

export default PubPageUpper;
