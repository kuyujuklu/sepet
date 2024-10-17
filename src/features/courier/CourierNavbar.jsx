import { NavLink } from "react-router-dom"

const CourierNavbar = () => {
    const isProfilePage = window.location.href.includes("/courier/profile")
    const isOrdersPage = window.location.href.includes("/courier/orders")
    return (
    <div className="flex py-3 bg-white gap-10 justify-center w-full border border-gray-300 rounded-t-lg ">
        
      <NavLink to="/courier/profile">
        <span className={`${isProfilePage ? "text-gray-900" : "text-gray-600"} `}>
            Profile
        </span>
      </NavLink>
      <NavLink to="/courier/orders" >
      <span className={`${isOrdersPage ? "text-gray-900" : "text-gray-600"} `}>
        Orders
      </span>
      </NavLink>
    </div>
  )
}

export default CourierNavbar
