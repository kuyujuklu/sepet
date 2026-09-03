import { NavLink, useLocation } from "react-router-dom"
import { PackageIcon, UserIcon } from "./icons"

const CourierNavbar = () => {
    const location = useLocation()
    const isProfilePage = location.pathname.includes("/courier/profile")
    const isOrdersPage = location.pathname.includes("/courier/orders")

    return (
      <div
        className="flex bg-white justify-around"
        style={{
          borderTop: "1px solid #e4e9ee",
          borderRadius: "20px 20px 0 0",
          padding: "10px 0 14px",
          boxShadow: "0 -2px 8px rgba(20,30,45,.05)",
        }}
      >
        <NavLink to="/courier/orders" className="flex flex-col items-center gap-1" style={{ color: isOrdersPage ? "#2D7DD2" : "#94a3b0" }}>
          <PackageIcon />
          <span className="text-[11px]" style={{ fontWeight: isOrdersPage ? 600 : 500 }}>Заказы</span>
        </NavLink>
        <NavLink to="/courier/profile" className="flex flex-col items-center gap-1" style={{ color: isProfilePage ? "#2D7DD2" : "#94a3b0" }}>
          <UserIcon />
          <span className="text-[11px]" style={{ fontWeight: isProfilePage ? 600 : 500 }}>Профиль</span>
        </NavLink>
      </div>
  )
}

export default CourierNavbar
