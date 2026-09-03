// Persists which pub a company last opened, so a company with more than one
// pub reopens the same one instead of asking again every time. Keyed by
// companyID since a user could plausibly switch companies later even though
// today's app only ever has one. Same try/catch idiom as the access-token
// helper in api/auth/authBasedQuery.js, for the same reason (private mode,
// storage disabled, etc. should degrade to "no memory", not throw).
const STORAGE_PREFIX = "lastUsedPubID:";

export const getLastUsedPubID = (companyID) => {
  if (!companyID) return null;

  try {
    return localStorage.getItem(STORAGE_PREFIX + companyID) || null;
  } catch (e) {
    return null;
  }
};

export const setLastUsedPubID = (companyID, pubID) => {
  if (!companyID || !pubID) return;

  try {
    localStorage.setItem(STORAGE_PREFIX + companyID, String(pubID));
  } catch (e) {
    // ignored - in-memory only for the rest of this session
  }
};
