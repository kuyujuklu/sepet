import { closePopupAreaClickHandler } from "@/utils/popupCloseAreaClickHandler";
import style from "./popup.module.scss";

const Popup = ({ opened, closeCallback, children }) => {
    const closeClickHandler = closePopupAreaClickHandler(() => {
        closeCallback()
    })
    
    return (
        <div
            className={`${style.popup} ${opened ? style.active : ""}`}
            onPointerDown={closeClickHandler}
        >

            <div className={style.content}>
                <div className={style.closeWrapper} onClick={closeCallback}>
                    <span className={style.closeContainer}>&times;</span>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Popup;
