"use client";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@mui/material";
import InputWithLabel from "@/components/Inputs/InputWithLabel";
import Popup from "@/components/Popup/Popup";
import WhiteSpinner from "@/components/loaders/WhiteSpinner";
import {
  closeCreateCategoryPopup,
  selectCreateCategoryPopupState,
} from "./categorySlice";
import { useCreateCategoryMutation } from "@/api/categories/category";
import { HexColorPicker } from "react-colorful";
import CheckboxWithLabel from "@/components/Inputs/CheckboxWithLabel";
import { useTranslation } from "react-i18next";
import { fixedCacheKeys } from "@/api/fixedCacheKeys";
import SelectWithLabel from "@/components/Inputs/SelectWithLabel";
import { categoryTypes } from "../../../static-data/data";
import Select from "../../../components/Inputs/Select";

const CreateCategoryPopup = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const popupState = useSelector(selectCreateCategoryPopupState);

  const [createCategory, { data, isLoading }] = useCreateCategoryMutation({
    fixedCacheKey: fixedCacheKeys.categories.create_category,
  });

  const closePopup = useCallback(() => {
    dispatch(closeCreateCategoryPopup());
  }, [dispatch]);

  const [name, setName] = useState("");
  const [visible, setVisible] = useState(true);
  const [textColor, setTextColor] = useState("#ffffff");
  const [colorPickerOpened, setColorPickerOpened] = useState(true);
  const [selectedCategoryTypes, setSelectedCategoryTypes] = useState([
    categoryTypes.Other.value,
  ]);

  useEffect(() => {
    if (data) {
      closePopup();
      setName("")
      setVisible(true)
      setTextColor("#ffffff")
      setColorPickerOpened(true)
      setSelectedCategoryTypes([categoryTypes.Other.value])
    }
  }, [closePopup, data]);

  const setCategoryTypeOnIndex = (value, index) => {
    let types = [...selectedCategoryTypes];
    types[index] = value;
    setSelectedCategoryTypes(types);
  };

  const addDish = () => {
    let types = [...selectedCategoryTypes];
    types.push(categoryTypes.Other.value);
    setSelectedCategoryTypes(types);
  };

  const deleteDish = (index) =>{ 
    let types = selectedCategoryTypes.filter((_, idx) => idx !== index);
    setSelectedCategoryTypes(types);
    
  }

  const handleButtonClick = () => {
    const category = {
      name,
      categoryTypes: selectedCategoryTypes,
      visible,
      textColor,
      place: popupState.place ?? 1,
    };

    if (
      !popupState.companyID ||
      !popupState.pubID ||
      !popupState.menuID ||
      !popupState.place
    ) {
      return;
    }

    createCategory({
      data: category,
      companyID: popupState.companyID,
      pubID: popupState.pubID,
      menuID: popupState.menuID,
    });
  };

  return (
    <Popup opened={popupState.opened} closeCallback={closePopup}>
      <div className="py-4">
        <header>
          <h1 className="font-bold text-center text-xl mb-10">
            {t("admin.popups.create_category_popup.headline")}
          </h1>
        </header>
        <main className="flex flex-col gap-6 mb-6">
          <InputWithLabel
            label={t("admin.popups.create_category_popup.name")}
            labelClassName={"text-xs sm:text-base text-gray-500 font-medium"}
            labelStyle={{
              marginBottom: ".1rem",
            }}
            value={name}
            setValue={setName}
          />
          {selectedCategoryTypes && (
            <div className="flex gap-5 items-center">
              {/* Label */}
              <span className="text-sm sm:text-base text-gray-500 font-medium">
                {t("admin.popups.create_category_popup.category_type")}
              </span>
              {/* Types */}
              <div className="flex gap-5 flex-row flex-wrap items-center">
                {/* Selected category types */}
                {selectedCategoryTypes.map((item, index) => (
                  <div
                    className="flex items-center gap-1"
                    style={{ height: 35 }}
                    key={index}
                  >
                    <Select
                      selectClassName={"text-xs sm:text-sm"}
                      value={item}
                      setValue={(value) => setCategoryTypeOnIndex(value, index)}
                      values={Object.keys(categoryTypes).map((key) => ({
                        value: categoryTypes[key].value,
                        text: t(categoryTypes[key].text),
                      }))}
                    />
                    <Button
                      variant="contained"
                      sx={{
                        color: "white",
                        bgcolor: "transparent",
                        height: "100%",
                        aspectRatio: 1,
                        fontSize: ".7rem",
                        fontWeight: "medium",
                        padding: ".7rem 1rem",
                        borderRadius: "10px",
                        ":hover": {
                          bgcolor: "transparent",
                        },
                      }}
                      onClick={() => deleteDish(index)}
                    >
                      <img src="/static/admin/images/svg/trash-can-red.svg" />
                    </Button>
                  </div>
                ))}
                {/* Add category type button */}
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
                  onClick={() => addDish()}
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
            </div>
          )}
          {/* Pick color */}
          <div>
            <div className="flex items-center gap-10">
              <span className="ml-2 text-xs sm:text-base text-gray-500 font-medium">
                {t("admin.popups.create_category_popup.text_color")}{" "}
              </span>
              <div
                style={{
                  width: "60px",
                  height: "30px",
                  background: textColor,
                }}
                className="cursor-pointer border-4 rounded-lg "
                onClick={() => setColorPickerOpened(!colorPickerOpened)}
              ></div>
            </div>
            {colorPickerOpened && (
              <div className="updatePubPopupColorBox mt-2">
                <HexColorPicker color={textColor} onChange={setTextColor} />
              </div>
            )}
          </div>
          <CheckboxWithLabel
            value={visible}
            setValue={setVisible}
            label={t("admin.popups.create_category_popup.visible")}
            labelClass={"mr-2 text-xs sm:text-base text-gray-500 font-medium"}
            inputStyle={{ padding: 0 }}
            inputClass={"border-gray-500"}
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
            {isLoading ? (
              <WhiteSpinner />
            ) : (
              t("admin.popups.create_category_popup.create_button")
            )}
          </Button>
        </footer>
      </div>
    </Popup>
  );
};

export default CreateCategoryPopup;
