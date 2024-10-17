import { Button } from "@mui/material";
import { useRemoveCourierMutation } from "../../../../api/pub/pub";
import { useDispatch } from "react-redux";
import { openCourierInfoPopup } from "../../../courier/popups/courierInfoPopupSlice";
import { openAddCourierPopup } from "./shippingSlice";
import { fixedCacheKeys } from "../../../../api/fixedCacheKeys";

const PubCouriersInput = ({ companyID, pubID, couriers }) => {
  const dispatch = useDispatch()
  const [removeCourier, { isLoading }] = useRemoveCourierMutation({fixedCacheKey: fixedCacheKeys.pubs.remove_courier_error});

  const deleteCourier = (courierID) => {
    removeCourier({ companyID, pubID, courierID });
  };

  const openCourierPopup = (courier) => {
    dispatch(openCourierInfoPopup({courier}))
  }

  const openAddingCourierPopup = () => {
    dispatch(openAddCourierPopup({
      companyID,
      pubID
    }))
  }

  return (
    <div  className="w-full flex-wrap flex gap-5 items-center">
        <Button
                  variant="contained"
                  sx={{
                    color: "white",
                    bgcolor: "#3b82f6",
                    fontSize: ".7rem",
                    fontWeight: "medium",
                    padding: ".5rem",
                    borderRadius: "10px",
                    width: "fit-content",
                    ":hover": {
                      bgcolor: "#3b82f6",
                    },
                  }}
                  onClick={() => openAddingCourierPopup()}
                >
                  <div
                    style={{
                      width: 18,
                      height: 19,
                      padding: "2px 2px 2px 2px",
                    }}
                  >
                    <img src="/static/admin/images/svg/plus-white.svg" />
                  </div>
                </Button>
      </div>
  );
};

export default PubCouriersInput;
