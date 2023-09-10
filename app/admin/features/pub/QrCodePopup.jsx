"use client"
import { useDispatch, useSelector } from "react-redux";
import { closeQrCodePopup, selectQrCodePopupState } from "./pubSlice";
import Popup from "../../components/Popup/Popup";
import Image from "next/image";

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
                <main className="flex flex-col gap-6 mb-6 p-6">
                    <div style={{maxHeight: 300, maxWidth: 300}} className="w-full relative m-auto aspect-square">
                        <Image 
                            src={"/api-static/images/pubs/qr/" + popupState.imageFileName}
                            alt="qr code"
                            fill
                        />
                    </div>
                </main>
                {/* <footer className="text-center">
                </footer> */}
            </div>
        </Popup>
    );
}

export default QrCodePopup