// The superadmin's "войти в заведение" flow just exchanges tokens (see
// AdministrationShipping.jsx's openPub) - the resulting session is a plain
// company-role token, indistinguishable from a normal company login on the
// backend. This flag is the only record that the current session got here
// via impersonation, so the admin panel can show a "you're viewing as
// superadmin" banner with its own way back, instead of ever routing the
// back button through the superadmin section.
//
// Same try/catch idiom as authBasedQuery.js's token helper - storage being
// unavailable should just mean "no banner", not a crash.
const STORAGE_KEY = "viaSuperAdmin";

export const markSuperAdminImpersonation = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, "true");
  } catch (e) {
    // ignored
  }
};

export const isSuperAdminImpersonation = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "true";
  } catch (e) {
    return false;
  }
};

export const clearSuperAdminImpersonation = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // ignored
  }
};
