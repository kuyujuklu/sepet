'use client'
import { Route, Routes, useNavigate } from "react-router-dom"
import Registration from "./features/auth/Registration";
import AuthWatcher from "./features/auth/AuthWatcher";
import CompanyPage from "./features/company/CompanyPage";
import Authentication from "./features/auth/Authentication";
import CreatePubPopup from "./features/pub/CreatePubPopup";
import UpdatePubPopup from "./features/pub/UpdatePubPopup";
import DeletePubPopup from "./features/pub/DeletePubPopup";
import PubPage from "./features/pub/PubPage";
import CreateMenuPopup from "./features/pub/Menus/CreateMenuPopup";
import UpdateMenuPopup from "./features/pub/Menus/UpdateMenuPopup";
import DeleteMenuPopup from "./features/pub/Menus/DeleteMenuPopup";
import CreateCategoryPopup from "./features/pub/Categories/CreateCategoryPopup";
import UpdateCategoryPopup from "./features/pub/Categories/UpdateCategoryPopup";
import DeleteCategoryPopup from "./features/pub/Categories/DeleteCategoryPopup";
import CreateDishPopup from "./features/pub/Dishes/CreateDishPopup";
import UpdateDishPopup from "./features/pub/Dishes/UpdateDishPopup";
import DeleteDishPopup from "./features/pub/Dishes/DeleteDishPopup";
import { useEffect } from "react";

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
        padding:"10px 20px",
        margin: "40px auto",
        minHeight: 500,
      }}
      className="shadow-2xl height-fit rounded-xl"
    >
      <Routes>
        <Route path="/auth/registration" element={<Registration />} />
        <Route path="/auth/authentication" element={<Authentication />} />
        <Route path="/company" element={<CompanyPage />} />
        <Route path="/company/pub/:pubID/*" element={<PubPage />} />
      </Routes>
      <AuthWatcher />
      <Popups />
    </div>
  )
}

const Popups =() => {
  return (
    <>
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
    </>
  )
}

export default App