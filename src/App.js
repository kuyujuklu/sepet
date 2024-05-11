import { useEffect } from "react"
import { Route, Routes, useNavigate } from "react-router-dom"
import Registration from "./features/auth/Registration"
import Authentication from "./features/auth/Authentication"
import CompanyPage from "./features/company/CompanyPage"
import PubPage from "./features/pub/PubPage"
import AdminPanel from "./features/admin/AdminPanel"
import Alerts from "./features/alerts/Alerts"
import ErrorHandlers from "./features/errorHandlers/ErrorHandlers"
import AuthWatcher from "./features/auth/AuthWatcher"
import GoogleMapsLoader from "./features/GoogleMapsLoader/GoogleMapsLoader"
import TariffPopup from "./features/company/TariffPopup"
import CreatePubPopup from "./features/pub/CreatePubPopup"
import UpdatePubPopup from "./features/pub/UpdatePubPopup"
import DeletePubPopup from "./features/pub/DeletePubPopup"
import CreateMenuPopup from "./features/pub/Menus/CreateMenuPopup"
import UpdateMenuPopup from "./features/pub/Menus/UpdateMenuPopup"
import DeleteMenuPopup from "./features/pub/Menus/DeleteMenuPopup"
import CreateCategoryPopup from "./features/pub/Categories/CreateCategoryPopup"
import UpdateCategoryPopup from "./features/pub/Categories/UpdateCategoryPopup"
import DeleteCategoryPopup from "./features/pub/Categories/DeleteCategoryPopup"
import CreateDishPopup from "./features/pub/Dishes/CreateDishPopup"
import UpdateDishPopup from "./features/pub/Dishes/UpdateDishPopup"
import DeleteDishPopup from "./features/pub/Dishes/DeleteDishPopup"
import QrCodePopup from "./features/pub/QrCodePopup"

import "./i18n"
import NewOrdersListener from "./features/admin/Orders/NewOrdersListener"
import SoundPlayer from "./features/sound/SoundPlayer"
import PayForPubPopup from "./features/company/PayForPubPopup"

const App = () => {
  return (
    <div>
      <Routes path="/">
        <Route path="/admin/*" element={<AppInner />} />
      </Routes>
    </div>
  )
}

const AppInner = () => {

  const navigate = useNavigate()

  useEffect(() => {
    if (window.location.pathname === "/admin") {
      navigate("/admin/company")
    }
  }, [navigate])
  return (
    <div 
      style={{
        maxWidth: 1280,
        padding:"10px 20px 200px",
        margin: "40px auto",
        minHeight: 500,
      }}
      className="shadow-2xl height-fit rounded-xl"
    >
      <Routes>
        <Route path="/auth/registration" element={<Registration />} />
        <Route path="/auth/authentication" element={<Authentication />} />
        <Route path="/company" element={<CompanyPage />} />
        {/* Edit menu  */}
        {/* <Route path="/company/pub/:pubID/*" element={<PubPage />} /> */}
        {/* Admin panel */}
        <Route path="/pub/:pubID/*" element={<AdminPanel />} />
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

const Popups =() => {
  return (
    <>
      <TariffPopup />
      <PayForPubPopup />

      <CreatePubPopup />
      <UpdatePubPopup />
      <DeletePubPopup />
      
      <CreateMenuPopup />
      <UpdateMenuPopup />
      <DeleteMenuPopup />
      
      <CreateCategoryPopup />
      <UpdateCategoryPopup />
      <DeleteCategoryPopup />

      <CreateDishPopup />
      <UpdateDishPopup />
      <DeleteDishPopup />

      <QrCodePopup />
    </>
  )
}

export default App;
