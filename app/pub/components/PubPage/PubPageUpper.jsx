import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "./PubPage";
import BlackSpinner from "@/app/admin/components/loaders/BlackSpinner";

const PubPageUpper = ({ pub }) => {
    const themeContext = useContext(ThemeContext);
    const [imageIsLoaded, setImageIsLoaded] = useState(false);
    useEffect(() => {
        setTimeout(() => setImageIsLoaded(true), 5000)
    }, [])
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
                    onLoad={() => setImageIsLoaded(true)}
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
            {
                pub.bg_image_file_name && !imageIsLoaded && (<div className="w-full h-full flex pt-3 justify-center"><BlackSpinner /></div>)
            }
        </div>
    );
};

export default PubPageUpper;