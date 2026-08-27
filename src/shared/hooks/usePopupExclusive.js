import { useEffect, useRef } from "react";

// Only one popup should ever be visible at once - two overlapping native
// Modals is a real bug (dimmed backdrops stack on top of each other, and on
// Android the back button/touch targets get confused about which one is "on
// top"). BottomSheet is the single place every popup in the app renders
// from, so the rule lives here: whichever popup opens most recently closes
// whatever was already open, by calling that popup's own `onClose`.
//
// A module-level singleton, not redux/context: this is pure UI coordination
// (which native Modal gets to be visible right now) - nothing else in the
// app needs to observe it, and popups are opened from redux slices that have
// no relationship to each other, so there is no natural shared ancestor to
// hold this as component state.
let activeId = null;
let requestActiveClose = null;

export const usePopupExclusive = (id, isOpened, onClose) => {
  // onClose is often a fresh arrow function every render (e.g. `() =>
  // dispatch(closeX())`); a ref keeps the effect below from re-running just
  // because the caller re-rendered with a new-but-equivalent callback.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpened) return undefined;

    // Someone else is already showing - they lose, we take over
    if (activeId && activeId !== id) {
      requestActiveClose?.();
    }

    activeId = id;
    requestActiveClose = () => onCloseRef.current?.();

    return () => {
      // Only release the slot if we still hold it - if we were the one
      // displaced above, the popup that displaced us already owns it
      if (activeId === id) {
        activeId = null;
        requestActiveClose = null;
      }
    };
  }, [id, isOpened]);
};
