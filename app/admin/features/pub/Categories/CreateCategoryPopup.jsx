import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import InputWithLabel from "@/app/admin/components/Inputs/InputWithLabel";
import Popup from "@/app/admin/components/Popup/Popup";
import WhiteSpinner from "@/app/admin/components/loaders/WhiteSpinner";
import { closeCreateCategoryPopup, selectCreateCategoryPopupState } from "./categorySlice";
import { useCreateCategoryMutation } from "@/app/admin/api/categories/category";

const CreateCategoryPopup = () => {
    const dispatch = useDispatch();
    const popupState = useSelector(selectCreateCategoryPopupState);

	const [createCategory, {data, error, isLoading}] = useCreateCategoryMutation()

    const closePopup = useCallback(() => {
        dispatch(closeCreateCategoryPopup());
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

	const handleButtonClick = () => {
		const pub = {
            name,
            visible,
            place: popupState.place ?? 1,
        }

        if(!popupState.companyID || !popupState.pubID || !popupState.menuID || !popupState.place) {
            return
        }

        createCategory({data: pub, companyID: popupState.companyID, pubID : popupState.pubID, menuID : popupState.menuID})
	}

    return (
        <Popup opened={popupState.opened} closeCallback={closePopup}>
            <div className="py-4">
                <header>
                    <h1 className="font-bold text-center text-xl mb-10">
                        Добавить категорию
                    </h1>
                </header>
                <main className="flex flex-col gap-6 mb-6">
                    <InputWithLabel
                        label={"Название категории"}
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
                        {isLoading ? <WhiteSpinner /> : "Добавить"}
                    </Button>
                </footer>
            </div>
        </Popup>
    );
};

export default CreateCategoryPopup;
