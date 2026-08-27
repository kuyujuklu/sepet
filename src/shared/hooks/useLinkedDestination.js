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
import { resolveDestinationFromFields } from "../utils/deepLink";

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

  const linkedDestination = useMemo(
    () =>
      resolveDestinationFromFields({
        path,
        pubID: urlPubID,
        pubName: urlPubName,
        orderID: urlOrderID,
      }),
    [path, urlPubID, urlPubName, urlOrderID],
  );

  // Always lands somewhere. A real deep link always wins; otherwise this is
  // just finishing whatever flow sent the client here to pick/confirm an
  // address (checkout, the top bar, ...), so going back to it beats bouncing
  // everyone to Home regardless of where they actually came from. Home is
  // only the fallback for the rare case there is nothing to go back to (e.g.
  // this screen itself was the deep-link target of a cold start).
  const goToLinkedDestination = () => {
    if (!linkedDestination) {
      if (navigator.canGoBack()) {
        navigator.goBack();
        return;
      }

      navigator.navigate(Screens.Home);
      return;
    }

    navigator.navigate(linkedDestination.screen, linkedDestination.params);
  };

  return { linkedDestination, goToLinkedDestination };
};
