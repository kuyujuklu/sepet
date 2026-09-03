import { NavLink } from "react-router-dom";

// Persistent identity bar shown at the root of every non-detail courier
// screen (Orders list, Profile) - avatar initial, name + id, balance pill.
// Language/logout used to live here; both moved into CourierProfile's
// settings block, matching the same header-decluttering already applied to
// the admin side (Header.jsx/Sidebar.jsx) earlier this session.
const CourierHeader = ({ courierID, courierName, balance }) => {
  const parsedBalance = isNaN(+balance) ? 0 : +balance;
  const balanceColor = parsedBalance >= 0 ? "#1a9e6b" : "#e0483a";
  const balanceTint = parsedBalance >= 0 ? "rgba(26,158,107,.1)" : "rgba(224,72,58,.1)";
  const initial = courierName?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <div className="w-full px-4 pt-4">
      <NavLink to="/courier/profile" className="block">
        <div
          className="flex items-center gap-3 bg-white rounded-2xl mx-auto"
          style={{
            maxWidth: 560,
            border: "1px solid #e4e9ee",
            boxShadow: "0 1px 2px rgba(20,30,45,.04)",
            padding: "14px 16px",
          }}
        >
          <div
            className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-[14px]"
            style={{ background: "#e8f1fb", color: "#2D7DD2" }}
          >
            {initial}
          </div>
          <div className="min-w-0 flex-grow">
            <div className="font-bold text-[14.5px] text-ink truncate">{courierName || "No name"}</div>
            <div className="text-[11.5px] text-muted-2">Курьер · ID {courierID}</div>
          </div>
          <div
            className="flex-shrink-0 flex items-center h-7 px-3 rounded-full font-bold text-[13px] num"
            style={{ background: balanceTint, color: balanceColor }}
          >
            {parsedBalance > 0 ? "+" : ""}
            {parsedBalance.toFixed(2)} Lei
          </div>
        </div>
      </NavLink>
    </div>
  );
};

export default CourierHeader;
