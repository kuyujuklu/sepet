import { useContext } from "react";
import { ThemeContext } from "./PubPage";

const PubPageUpper = ({ pub }) => {
    const themeContext = useContext(ThemeContext);

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
            {pub.bg_image_file_name && (
                <img
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
        </div>
    );
};

export default PubPageUpper;