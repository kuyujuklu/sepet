"use client"
import { useDispatch, useSelector } from "react-redux";
import { closeQrCodePopup, selectQrCodePopupState } from "./pubSlice";
import Popup from "@/components/Popup/Popup";

const QrCodePopup = () => {
    const dispatch = useDispatch();
    const popupState = useSelector(selectQrCodePopupState);

    const closePopup = () => dispatch(closeQrCodePopup());

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        QR Code
                    </h1>
                </header>
                <main className="flex flex-col items-center gap-6 mb-6 p-6">
                    <div style={{maxHeight: 300, maxWidth: 300}} className="w-full relative m-auto aspect-square">
                        <img 
                            src={"/api-static/images/pubs/qr/" + popupState.imageFileName}
                            alt="qr code"
                        />
                    </div>
                <a href={popupState.pubURL} className="text-blue-500">
                      {popupState.pubURL}
                </a>
                </main>
                <footer className="text-center">
                </footer>
            </div>
        </Popup>
    );
}

export default QrCodePopup