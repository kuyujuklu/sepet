import { createSlice } from "@reduxjs/toolkit";

export const errorKeys = {
    get_company: 'get_company',
    get_pub_by_id: "get_pub_by_id",
    get_pubs: "get_pubs",
    get_menu_by_id: "get_menu_by_id",
    get_menus: "get_menus",
    get_category_by_id: "get_category_by_id",
    get_categories: "get_categories",
    get_dish_by_id: "get_dish_by_id",
    get_dishes: "get_dishes",
    get_pub_shipping: "get_pub_shipping",
    get_pub_preorder: "get_pub_preorder",

    //authentication
    authentication: 'authentication',
    registration: 'registration',
    logout: 'logout',
};

const initialState = {
    standardHandlingError: null,
    receivingErrors: {
        [errorKeys.get_company]: null,
        [errorKeys.get_pub_by_id]: null,
        [errorKeys.get_pubs]: null,
        [errorKeys.get_menu_by_id]: null,
        [errorKeys.get_menus]: null,
        [errorKeys.get_category_by_id]: null,
        [errorKeys.get_categories]: null,
        [errorKeys.get_dish_by_id]: null,
        [errorKeys.get_dishes]: null,

        [errorKeys.registration]: null,
        [errorKeys.authentication]: null,
        [errorKeys.logout]: null,
    },
};

const errorHandlerSlice = createSlice({
    name: "errorHandlerSlice",
    initialState,
    reducers: {
        handleErrorStandardWay(state, action) {
            state.standardHandlingError = action.payload ?? null;
            console.log("pushedStandardError ", action.payload);
        },
        setReceivingError(state, action) {
            const errorKey = action.payload.errorKey;
            if(!errorKey) return;
            console.log("setting error key", errorKey, " \n error ", action.payload.error)
            state.receivingErrors[errorKey] = action.payload.error ?? null;
        },
    },
});

export const selectStandardHandlingError = (state) =>
    state.errorHandlerSlice.standardHandlingError;

export const selectReceivingError = errorKey => state => state.errorHandlerSlice.receivingErrors[errorKey];

export const {
    handleErrorStandardWay,
    setReceivingError
} = errorHandlerSlice.actions;

export default errorHandlerSlice.reducer;
