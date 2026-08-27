import { useSelector } from "react-redux";
import { useGetPubInfoQuery } from "../api/pubs/pubsApi";
import { selectGeolocation } from "../../features/store/geolocation/geolocationSlice";

// Pub-info, always asked for with the current coordinates.
//
// The by-id route accepts lat/lng now and answers with `distance`,
// `shipping_price`, `shipping_free_delivery_price` and
// `shipping_min_order_price` - so a screen showing a delivery price no longer
// has to hold the nearby-pubs response next to this one and merge the two.
//
// Every caller goes through this hook so they all produce the same cache key
// and RTK Query dedupes them into one request; calling
// useGetPubInfoQuery({ pubID }) directly would open a second, coordinate-less
// cache entry with no prices in it.
export const usePubInfo = ({ pubID, pubName } = {}, options = {}) => {
  const location = useSelector(selectGeolocation);

  return useGetPubInfoQuery(
    {
      pubID,
      pubName,
      coords: location ? { lat: location.lat, lng: location.lng } : undefined,
    },
    { ...options, skip: (!pubID && !pubName) || !!options.skip },
  );
};
