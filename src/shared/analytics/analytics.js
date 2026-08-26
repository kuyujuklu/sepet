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

export const setAnalyticsSink = (nextSink) => {
  sink = typeof nextSink === "function" ? nextSink : noopSink;
};

export const track = (event, props = {}) => {
  if (!event) return;

  // Analytics must never be able to break the app
  try {
    sink(event, props);
  } catch (e) {
    // ignored on purpose
  }
};

export const trackScreen = (screen) => {
  if (!screen) return;

  track(events.screenView, { screen });
};

export { events };
