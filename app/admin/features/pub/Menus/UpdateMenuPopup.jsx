import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import { closeUpdateMenuPopup, selectUpdateMenuPopupState } from "./menuSlice";
import { useUpdateMenuMutation } from "@/app/admin/api/menu/menu";
import InputWithLabel from "@/app/admin/components/Inputs/InputWithLabel";
import Popup from "@/app/admin/components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";

const UpdateMenuPopup = () => {
    const dispatch = useDispatch();
    const popupState = useSelector(selectUpdateMenuPopupState);

	const [updateMenu, {data, error, isLoading}] = useUpdateMenuMutation()

    const closePopup = useCallback(() => {
        dispatch(closeUpdateMenuPopup());
    }, [dispatch]);

    const [name, setName] = useState("");
    const [visible, setVisible] = useState(true);

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

    useEffect(() => {
        if (popupState.initialMenu) {
            setName(popupState.initialMenu.name);
            setVisible(popupState.initialMenu.visible);
        }
    }, [popupState.initialMenu]);

	const handleButtonClick = () => {
		const pub = {
            name,
            visible,
        }

        if(!popupState.companyID || !popupState.pubID || !popupState.menuID) {
            return
        }

        updateMenu({data: pub, companyID: popupState.companyID, pubID : popupState.pubID, menuID: popupState.menuID})
	}

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        Редактировать меню
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={"Название меню"}
                        labelClassName={"text-xs sm:text-base text-gray-500 font-medium"}
                        labelStyle={{
                            marginBottom: ".1rem",
                        }}
                        value={name}
                        setValue={setName}
                    />
                </main>
                <footer className="text-center">
                    <Button
                        variant="contained"
                        sx={{
                            color: "white",
                            bgcolor: "rgb(31 41 55)",
                            fontSize: ".7rem",
                            fontWeight: "medium",
                            padding: ".7rem 1rem",
                            borderRadius: "10px",
                            width: "90%",
                            ":hover": {
                                bgcolor: "rgb(17 24 39)",
                            },
                        }}
                        onClick={handleButtonClick}
                    >
                        {isLoading ? <WhiteSpinner /> : "Сохранить"}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default UpdateMenuPopup;
