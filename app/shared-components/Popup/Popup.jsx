"use client"

import { closePopupAreaClickHandler } from "@/app/utils/popupCloseAreaClickHandler";
import style from "./popup.module.scss";

const Popup = ({ popupStyle, contentStyle, opened, closeCallback, children }) => {
  const closeClickHandler = closePopupAreaClickHandler(() => {
    closeCallback()
  })

  return (
    <div
      style={popupStyle}
      className={`${style.popup} ${opened ? style.active : ""}`}
      onPointerDown={closeClickHandler}
    >

      <div className={style.content} style={contentStyle}>
        <div className={style.closeWrapper} onClick={closeCallback}>
          <span className={style.closeContainer}>&times;</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Popup;
