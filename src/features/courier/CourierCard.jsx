import { Button } from '@mui/material';
import React from 'react'
import { useDispatch } from 'react-redux';
import { openCourierInfoPopup } from './popups/courierInfoPopupSlice';



const CourierCard = ({ courier, }) => {
    const dispatch = useDispatch()
    const openCourierPopup = (courier) => {
      dispatch(openCourierInfoPopup({courier}))
    }

    return (
      <div className="flex items-center w-full h-fit gap-2">
        <Button
          style={{ height: 50, width: "100%", maxWidth: 120 }}
          variant="contained"
          sx={{
            color: "black",
            bgcolor: "transparent",
            aspectRatio: 1,
            fontSize: ".7rem",
            fontWeight: "medium",
            padding: ".7rem 1rem",
            borderRadius: "10px",
            position: "relative",
            ":hover": {
              bgcolor: "transparent",
            },
          }}
          onClick={() => openCourierPopup(courier)}
        >
          <span className="break-kee text-xs" style={{textTransform: "none"}}>{courier?.full_name}</span>
        </Button>
      </div>
    );
  };

export default CourierCard
