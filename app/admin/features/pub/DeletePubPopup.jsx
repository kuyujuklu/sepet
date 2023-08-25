import { useDispatch, useSelector } from "react-redux";
import Popup from "../../components/Popup/Popup";
import { closeDeletePubPopup, selectDeletePubPopupState } from "./pubSlice";
import { useCallback, useEffect } from "react";
import { Button } from "@mui/material";
import WhiteSpinner from "../../components/loaders/WhiteSpinner";
import { useDeletePubMutation } from "../../api/pub/pub";

const DeletePubPopup = () => {
    const dispatch = useDispatch();
    const popupState = useSelector(selectDeletePubPopupState);

    const [deletePopup, { data, error, isLoading }] = useDeletePubMutation();

    const closePopup = useCallback(() => {
        dispatch(closeDeletePubPopup());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            closePopup();
        }
    }, [closePopup, data]);

    useEffect(() => {
        if (error) {
            //TODO: handle error
        }
    }, [closePopup, data, error]);

    const handleButtonClick = () => {
        let companyID = popupState?.companyID;
        let pubID = popupState?.pubID;

        if (!companyID || !pubID) {
            return;
        }

        deletePopup({ 
            companyID, 
            pubID
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        Удалить заведение
                    </h1>
                </header>
                <main className="mb-10">
                    <p className="text-center">
                        Вы уверены, что хотите удалить заведение?
                        <br />
                        После удаления нельзя будет восстановить данные.
                    </p>
                </main>
                <footer className="text-center">
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor: "rgb(220 38 38)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".5rem 0",
                            borderRadius: "10px",
                            width: "90%",
                            ":hover": {
                                bgcolor: "rgb(185 28 28)",
                            },
                        }}
                        onClick={handleButtonClick}
                    >
                        {isLoading ? <WhiteSpinner /> : "Удалить"}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default DeletePubPopup;
