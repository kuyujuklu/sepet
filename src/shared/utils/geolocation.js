import { getCityTranslationKey } from "./cities";

// How the current location is written out for a person. Shared by the top bar
// and by checkout so they never disagree about where the order is going.
//
// Returns null only when we truly know nothing; an approximate location always
// produces something ("Кишинёв", "Рядом с вами"), because "укажите адрес" next
// to a working feed of nearby pubs is simply confusing.
export const getLocationLabel = (location, t) => {
  const parts = [location?.town, location?.fullAddress].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");

  if (location?.cityId) return t(getCityTranslationKey(location.cityId));

  if (location?.lat && location?.lng) return t("header.near_you");

  return null;
};

// Is the address good enough to deliver to? An approximate location has
// coordinates but nobody ever confirmed a street and a house number.
export const isAddressComplete = (location) =>
  !!location?.town && !!location?.fullAddress && !location?.isApproximate;
