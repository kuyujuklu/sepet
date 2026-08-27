import { useSelector } from "react-redux";
import { useGetClientQuery } from "../api/client/clientApi";
import { selectClient } from "../../features/store/auth/authSlice";
import { selectActiveOrders } from "../../features/store/orders/ordersSlice";

// Is something on its way right now?
//
// Orders lost their permanent tab, so the badge on the profile button is the
// only place this shows. `GET /api/client` answers it directly with
// `has_active_order` - no need to pull the whole order history to find out.
//
// The redux slice is checked first because it is the fresher of the two: it is
// fed by the orders websocket and by the order that was just created, both of
// which happen after the client record was fetched.
export const useHasActiveOrder = () => {
  const client = useSelector(selectClient);
  const activeOrders = useSelector(selectActiveOrders);

  const isGuest = !client || client.isGuest;

  const { data } = useGetClientQuery(undefined, { skip: isGuest });

  if (isGuest) return false;

  return activeOrders.length > 0 || !!data?.has_active_order;
};
