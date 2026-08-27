import * as Linking from "expo-linking";
import { Screens } from "../../app/navigation/screens";

// Parses an app URL (custom scheme or universal link) into the raw fields it
// carries. Shared by:
//  - LinkingWathcer, which keeps this in redux for links received while the
//    app is already running;
//  - App.js, which reads the *initial* launch URL synchronously so a cold
//    start from a deep link never mounts the section picker first.
export const parseDeepLink = (url) => {
  if (!url) return null;

  const parsedUrl = Linking.parse(url);
  const queryParams = parsedUrl.queryParams ?? {};

  let path = queryParams.Path ?? null;
  let pubID = queryParams.PubID ?? null;
  let pubName = null;

  const partsOfPath = parsedUrl?.path?.split("/") ?? [];
  const indexOfPubWord = partsOfPath.findIndex((part) => part === "pub");

  if (indexOfPubWord >= 0 && partsOfPath.length > indexOfPubWord + 1) {
    path = Screens.PubInfo;

    const pubIdentifier = partsOfPath[indexOfPubWord + 1] || queryParams.PubID;
    if (isNaN(+pubIdentifier)) {
      pubName = pubIdentifier;
    } else {
      pubID = +pubIdentifier;
    }
  }

  const orderID = queryParams.OrderID ? +queryParams.OrderID : null;

  return { path, pubID, pubName, orderID };
};

// Turns { path, pubID, pubName, orderID } - whether freshly parsed from a URL
// or read back out of redux - into the screen + params it points to. Kept as
// one function so useLinkedDestination (redux-backed, used once the app is
// already running) and resolveDeepLinkDestination (URL-backed, used before
// the first render) can't drift apart.
export const resolveDestinationFromFields = ({ path, pubID, pubName, orderID }) => {
  if (path === Screens.PubInfo && (pubID || pubName)) {
    return { screen: Screens.PubInfo, params: { pubID, pubName } };
  }

  if (path === Screens.OrderInfoPage && orderID) {
    return { screen: Screens.OrderInfoPage, params: { orderID } };
  }

  if (Screens[path]) return { screen: Screens[path], params: undefined };

  return null;
};

// Same resolution rules useLinkedDestination applies to redux state, but
// operating directly on a URL - needed at the point where we can't wait for a
// redux round trip (the very first render, before anything is mounted).
export const resolveDeepLinkDestination = (url) => {
  const parsed = parseDeepLink(url);
  if (!parsed) return null;

  return resolveDestinationFromFields(parsed);
};
