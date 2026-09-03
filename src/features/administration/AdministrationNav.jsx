import { NavLink } from "react-router-dom";
import LogoutButton from "../company/LogoutButton";

// Pill nav between the superadmin screens - matches Orders/OrdersFilter.jsx's
// filter-pill treatment (dark-filled active pill, bordered-transparent
// inactive) instead of the old flat blue/gray buttons.
const pillStyle = ({ isActive }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 36,
  padding: "0 16px",
  borderRadius: 20,
  fontSize: 13,
  fontWeight: 600,
  flexShrink: 0,
  background: isActive ? "#1c2733" : "transparent",
  color: isActive ? "#fff" : "#526070",
  border: isActive ? "none" : "1.5px solid #e4e9ee",
  textDecoration: "none",
});

const AdministrationNav = () => {
  return (
    <div className="flex items-center gap-2 flex-wrap px-4 pt-4 pb-1">
      <NavLink to="/administration/orders" style={pillStyle}>
        Заказы
      </NavLink>
      <NavLink to="/administration/shipping" style={pillStyle}>
        Доставка
      </NavLink>
      <NavLink to="/administration/pub-settings" style={pillStyle}>
        Настройки заведений
      </NavLink>
      <NavLink to="/administration/push" style={pillStyle}>
        Пуши
      </NavLink>
      <div className="ml-auto">
        <LogoutButton />
      </div>
    </div>
  );
};

export default AdministrationNav;
