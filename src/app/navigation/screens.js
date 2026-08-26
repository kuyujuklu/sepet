// The route names of the app.
//
// They live here rather than in App.js on purpose: half a dozen widgets need
// them, and importing them from App.js made every one of those widgets part of
// a require cycle (App -> screen -> widget -> App). Metro allows cycles but
// resolves them with whatever is initialised first, which is how you get an
// `undefined` route name at runtime.
export const Screens = {
  SectionPicker: "SectionPicker",
  Home: "Home",
  Registration: "Registration",
  Authentication: "Authentication",
  ChangePassword: "ChangePassword",
  SelectGeolocationPage: "SelectGeolocationPage",
  PubInfo: "PubInfo",
  Basket: "Basket",
  CreateOrder: "CreateOrder",
  Orders: "Orders",
  OrderInfoPage: "OrderInfoPage",
  Profile: "Profile",
  NoInternetPage: "NoInternetPage",
  ExpiredVersionPage: "ExpiredVersionPage",
};
