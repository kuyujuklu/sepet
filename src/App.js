import { useEffect } from "react"
import { Route, Routes, useNavigate } from "react-router-dom"
import Registration from "./features/auth/Registration"
import Authentication from "./features/auth/Authentication"
import CompanyPage from "./features/company/CompanyPage"
import AdminPanel from "./features/admin/AdminPanel"
import Alerts from "./features/alerts/Alerts"
import ErrorHandlers from "./features/errorHandlers/ErrorHandlers"
import AuthWatcher from "./features/auth/AuthWatcher"
import GoogleMapsLoader from "./features/GoogleMapsLoader/GoogleMapsLoader"
import TariffPopup from "./features/company/TariffPopup"
import CreatePubPopup from "./features/pub/CreatePubPopup"
import CreateMenuPopup from "./features/pub/Menus/CreateMenuPopup"
import UpdateMenuPopup from "./features/pub/Menus/UpdateMenuPopup"
import DeleteMenuPopup from "./features/pub/Menus/DeleteMenuPopup"
import CreateCategoryPopup from "./features/pub/Categories/CreateCategoryPopup"
import UpdateCategoryPopup from "./features/pub/Categories/UpdateCategoryPopup"
import DeleteCategoryPopup from "./features/pub/Categories/DeleteCategoryPopup"
import BulkPricePopup from "./features/pub/Categories/BulkPricePopup"
import CreateDishPopup from "./features/pub/Dishes/CreateDishPopup"
import UpdateDishPopup from "./features/pub/Dishes/UpdateDishPopup"
import DeleteDishPopup from "./features/pub/Dishes/DeleteDishPopup"

import "./i18n"
import NewOrdersListener from "./features/admin/Orders/NewOrdersListener"
import SoundPlayer from "./features/sound/SoundPlayer"
import PayForPubPopup from "./features/company/PayForPubPopup"
import DeleteDishFromOrderPopup from "./features/admin/Orders/OrderInfo/DeleteDishFromOrderPopup"
import AddDishToOrderPopup from "./features/admin/Orders/OrderInfo/AddDishToOrderPopup"
import CourierPage from "./features/courier/CourierPage"
import CourierInfoPopup from "./features/courier/popups/CourierInfoPopup"
import AddCourierPopup from "./features/admin/ShippingAndPreorder/Shipping/AddCourierPopup"
import CourierReserveOrderPopup from "./features/courier/popups/CourierReserveOrderPopup"
import DeleteClientAccount from "./components/DeleteClientAccount/DeleteClientAccount"
import AdministrationOrders from "./features/administration/AdministrationOrders"
import AdministrationShipping from "./features/administration/AdministrationShipping"
import AdministrationPubSettings from "./features/administration/AdministrationPubSettings"
import AdministrationPush from "./features/administration/AdministrationPush"

const App = () => {
  return (
    <div>
      <AppInner />
    </div>
  )
}

const AppInner = () => {

  const navigate = useNavigate()

  useEffect(() => {
    if (window.location.pathname === "/admin") {
      navigate("/admin/company")
    } else if (window.location.pathname === "/") {
      // No route matches bare "/" at all - it rendered nothing (blank
      // white screen) rather than 404ing, since <Routes> just has no match.
      navigate("/admin/auth/authentication")
    }
  }, [navigate])
  return (
    <div
      style={{
        maxWidth: 1280,
        padding: "0 10px",
        margin: "0 auto",
      }}
      className=""
    >
      <Routes>
        <Route path="/admin/*" element={<AdminInner />} />
        <Route path="/administration/orders" element={<AdministrationOrders />} />
        <Route path="/administration/shipping" element={<AdministrationShipping />} />
        <Route path="/administration/pub-settings" element={<AdministrationPubSettings />} />
        <Route path="/administration/push" element={<AdministrationPush />} />
        <Route path="/courier/*" element={<CourierPage />} />
      </Routes>

      <Alerts />
      <ErrorHandlers />
      <AuthWatcher />
      <Popups />
      <GoogleMapsLoader />
      <NewOrdersListener />
      <SoundPlayer />
    </div>
  )
}

const Popups = () => {
  return (
    <>
      <TariffPopup />
      <PayForPubPopup />

      <CreatePubPopup />

      <CreateMenuPopup />
      <UpdateMenuPopup />
      <DeleteMenuPopup />

      <CreateCategoryPopup />
      <UpdateCategoryPopup />
      <DeleteCategoryPopup />
      <BulkPricePopup />

      <CreateDishPopup />
      <UpdateDishPopup />
      <DeleteDishPopup />

      <DeleteDishFromOrderPopup />
      <AddDishToOrderPopup />

      <CourierInfoPopup />
      <AddCourierPopup />
      <CourierReserveOrderPopup />

    </>
  )
}

const AdminInner = () => {
  return (
    <Routes>
      <Route path="/auth/registration" element={<Registration />} />
      <Route path="/auth/authentication" element={<Authentication />} />
      <Route path="/company" element={<CompanyPage />} />
      <Route path="/pub/:pubID/*" element={<AdminPanel />} />
      <Route path="/delete-client*" element={<DeleteClientAccount />} />
    </Routes>
  )

}

export default App;
