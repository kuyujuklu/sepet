import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect } from "react";
import { Button } from "@mui/material";
import { useDeleteMenuMutation } from "@/app/admin/api/menu/menu";
import { closeDeleteMenuPopup, selectDeleteMenuPopupState } from "./menuSlice";
import Popup from "@/app/admin/components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";

const DeleteMenuPopup = () => {
    const dispatch = useDispatch();
    const popupState = useSelector(selectDeleteMenuPopupState);

    const [deleteMenu, { data, error, isLoading }] = useDeleteMenuMutation();

    const closePopup = useCallback(() => {
        dispatch(closeDeleteMenuPopup());
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
        let menuID = popupState?.menuID;

        if (!companyID || !pubID || !menuID) {
            return;
        }

        deleteMenu({ 
            companyID, 
            pubID,
            menuID
        });
    };

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        Удалить меню
                    </h1>
                </header>
                <main className="mb-10">
                    <p className="text-center">
                        Вы уверены, что хотите удалить меню?
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

export default DeleteMenuPopup;
