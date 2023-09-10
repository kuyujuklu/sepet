import Image from "next/image";
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
                <Image
                    src={`/api-static/images/pubs/bgs/${pub.bg_image_file_name}`}
                    alt="pub-cover"
                    fill
                    style={{
                        objectFit: "cover",
                    }}
                />
            )}
        </div>
    );
};

export default PubPageUpper;