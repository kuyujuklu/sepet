import { events } from "./events";

// Vendor-agnostic seam. No SDK is installed yet: the app only calls track(),
// and whoever wires Mixpanel / GA4 / anything else later just calls
// setAnalyticsSink(fn) once on startup - no screen has to be touched again.
//
// Never put PII in the props (no phone, no full address).

const noopSink = () => {};

const consoleSink = (event, props) => {
  console.log("[analytics]", event, props);
};

let sink = typeof __DEV__ !== "undefined" && __DEV__ ? consoleSink : noopSink;

// The stable analytics id of the client (`client.id`). It rides on every
// event so a funnel does not have to be stitched together by phone number,
// which is PII and changes hands.
let identity = null;

// The consent kill switch. The client's answer is stored server-side
// (POST /api/client/analytics-consent) and mirrored here; until we know it,
// tracking runs - the events carry no PII, and the flag flips the moment the
// client record arrives.
let isEnabled = true;

export const setAnalyticsSink = (nextSink) => {
  sink = typeof nextSink === "function" ? nextSink : noopSink;
};

export const setAnalyticsIdentity = (clientID) => {
  identity = clientID ?? null;
};

export const setAnalyticsEnabled = (enabled) => {
  isEnabled = enabled !== false;
};

export const track = (event, props = {}) => {
  if (!event) return;
  if (!isEnabled) return;

  // Analytics must never be able to break the app
  try {
    sink(event, identity === null ? props : { ...props, client_id: identity });
  } catch (e) {
    // ignored on purpose
  }
};

export const trackScreen = (screen) => {
  if (!screen) return;

  track(events.screenView, { screen });
};

export { events };
