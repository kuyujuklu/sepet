# Дальше/Создать заказ: snug card, safe-area padding split out

Date: 2026-08-27

## What & why

Follow-up to `changes/2026-08-27-bottom-bar-flush-to-edge.md` (which fixed the bar not
reaching the true bottom edge). That fix put the whole safe-area clearance into the same
box's `paddingBottom`, right alongside the visible top border - so the bordered "card"
around the button grew by however tall the safe area happens to be (up to ~76px with the
Android floor from the very first fix in this chain). The button ended up looking like it
was floating high inside an oversized grey slab instead of sitting snugly against the
bottom.

Note for future sessions: the screenshots this round were plainly from an iPhone (status
bar clock/wifi/battery glyphs, home-indicator bar) - the "old Android 3-button nav" framing
in the two earlier notes in this chain was written from code + generic knowledge, never
confirmed against an actual device/screenshot. The fix in this note is platform-agnostic
(it does not depend on which platform's inset was the original trigger), but if that
Android framing turns out to have been wrong, `useSafeBottomInset`'s `MIN_ANDROID_BOTTOM_INSET
= 64` floor is worth re-examining against a real Android device rather than taken on faith.

## Files

### Modified

- `src/pages/Basket/BasketPage.jsx`, `src/widgets/Orders/CreateOrder/CreateOrder.jsx` —
  each `bottomBar` split into two nested views:
  - `bottomBarSafeArea` (outer): `position: absolute, bottom: 0`, same background color,
    **no border**, `paddingBottom: bottomBarInset` (just the raw safe-area clearance, no
    extra gap added).
  - `bottomBar` (inner): the actual visible card - fixed `paddingTop/paddingBottom: 12`
    regardless of device, and the top border. This is what should look "10-15% bigger than
    the button," and now does, on every device, independent of how tall that device's
    safe-area inset is.

## How it works

The two boxes share one background color, so there is still no seam and no gap for list
content to show through (the thing the previous fix in this chain was for) - the safe-area
strip is invisible, it just reads as normal bottom padding rather than as part of the
button's card. The bordered card itself no longer grows or shrinks with the safe-area
inset at all; it is always exactly `12px + button height + 12px`. The button's actual
on-screen distance from the true edge is unchanged (same total padding as before, just
split across two views) - what changed is purely that the border no longer spans across
the dead space, which was the part making it look like an oversized, unfamiliar backdrop.

## Backend gaps

None - client-side layout only.

## Known limits / follow-ups

- Verified with `npx expo export --platform ios` (compiles) and reading both files back;
  not opened on a device. Given the screenshots that prompted this whole chain were iOS,
  it would be worth a same-device screenshot check specifically (previous rounds were only
  sanity-checked via `expo export`, never against the actual reporting device).
- If "the button should also be narrower than the full bar width" was part of the original
  ask (re-read as possibly about height/overall size instead - see the note above), that
  part was not done here - the button still stretches to the card's inner width
  (`SCREEN_PADDING` on each side, same as before). Flag if the button itself should also
  shrink to a narrower pill rather than just having a snugger frame around it.
