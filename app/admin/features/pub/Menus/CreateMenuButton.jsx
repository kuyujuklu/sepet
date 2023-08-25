import Image from "next/image"
import { ThemeContext } from "../PubPage";
import { useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { openCreateMenuPopup } from "./menuSlice";
import { selectCompanyID } from "../../company/companySlice";
import { selectPubID } from "../pubSlice";

const CreateMenuButton = ({place}) => {
    const dispatch = useDispatch();
    const companyID = useSelector(selectCompanyID);
    const pubID = useSelector(selectPubID);
    const themeContext = useContext(ThemeContext);
  
    const handleClick = () => {
        dispatch(openCreateMenuPopup({companyID, pubID, place}));  
    }

    return (
    <div className="cursor-pointer flex items-center justify-center"
      style={{
        minWidth: "30px",
        minHeight: "30px",
      }}
    >
        <Image
            onClick={handleClick}
            src={
                themeContext.theme === "dark"
                    ? "/images/svg/plus-in-circle-white.svg"
                    : "/images/svg/plus-in-circle-black.svg"
            }
            alt="settings"
            width={30}
            height={30}
        />
    </div>
  )
}

export default CreateMenuButton