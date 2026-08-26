import { useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import {
  selectOrderID,
  selectPath,
  selectPubID,
  selectPubName,
} from "../../features/store/linking/linkingSlice";
import { Screens } from "../../app/navigation/screens";

// Where a deep link wants us to go.
//
// This used to be copy-pasted inside the geolocation wizard, which was the
// first screen of the app. The wizard is not the entry point any more, so the
// resolution lives here and both the section picker and the wizard use it.
export const useLinkedDestination = () => {
  const navigator = useNavigation();

  const path = useSelector(selectPath);
  const urlPubID = useSelector(selectPubID);
  const urlPubName = useSelector(selectPubName);
  const urlOrderID = useSelector(selectOrderID);

  const linkedDestination = useMemo(() => {
    if (path === Screens.PubInfo && (urlPubID || urlPubName)) {
      return {
        screen: Screens.PubInfo,
        params: { pubID: urlPubID, pubName: urlPubName },
      };
    }

    if (path === Screens.OrderInfoPage && urlOrderID) {
      return { screen: Screens.OrderInfoPage, params: { orderID: urlOrderID } };
    }

    if (Screens[path]) return { screen: Screens[path], params: undefined };

    return null;
  }, [path, urlPubID, urlPubName, urlOrderID]);

  // Always lands somewhere: Home is the destination when there is no link
  const goToLinkedDestination = () => {
    if (!linkedDestination) {
      navigator.navigate(Screens.Home);
      return;
    }

    navigator.navigate(linkedDestination.screen, linkedDestination.params);
  };

  return { linkedDestination, goToLinkedDestination };
};
