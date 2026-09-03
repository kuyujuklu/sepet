import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setaccesstoken } from "@/api/auth/authBasedQuery";
import { refreshTokenAsAdmin } from "@/api/auth/refreshToken";
import {
  clearSuperAdminImpersonation,
  isSuperAdminImpersonation,
} from "@/utils/superAdminImpersonation";

// Sits above everything else in the admin panel whenever the current
// session got here via the superadmin's "войти в заведение" - the only
// way back to superadmin now, since every in-app back button stays inside
// this venue's own admin (see backTo on the PageHeaders) rather than
// walking back through raw navigation history.
const SuperAdminImpersonationBanner = () => {
  const navigate = useNavigate();
  // Read once on mount, not on every render - logging out from in here
  // clears the flag and immediately unmounts this whole tree anyway.
  const [showing] = useState(() => isSuperAdminImpersonation());

  if (!showing) return null;

  const exitToSuperAdmin = async () => {
    const res = await refreshTokenAsAdmin();
    if (!res?.ok) {
      // admin_refresh_token itself expired/absent (e.g. this tab has been
      // open long enough that even that outlived its life) - no way back
      // without logging in again.
      navigate("/admin/auth/authentication");
      return;
    }
    setaccesstoken(res.accesstoken);
    clearSuperAdminImpersonation();
    navigate("/administration/orders");
  };

  return (
    <div
      className="flex items-center justify-center gap-3 text-white text-[13px] font-medium"
      style={{ background: "#1c2733", padding: "8px 16px" }}
    >
      <span>Вы просматриваете это заведение как супер-админ</span>
      <button
        type="button"
        onClick={exitToSuperAdmin}
        className="underline font-semibold"
      >
        Выйти в супер-админ →
      </button>
    </div>
  );
};

export default SuperAdminImpersonationBanner;
