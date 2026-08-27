# Android nav bar buttons invisible on a dark system theme

Date: 2026-08-27

## What & why

Client report: on Android, the system navigation bar buttons (the gesture pill /
back-home-recents row) become invisible against a dark background; on a light system
theme they show fine.

Root cause: the app has no dark theme of its own - every screen is always a light
background - but `app.json` has `"userInterfaceStyle": "automatic"` and Android
runs edge-to-edge (`android.edgeToEdgeEnabled: true`). With no explicit nav bar
style set, the nav bar's button color follows the *system* theme: on a phone set to
Android dark mode, the OS renders **light/white** nav bar icons, which vanish
against this app's always-light screens. On a light system theme the OS renders
dark icons, which is why the client saw no problem there. This is the exact same
category of bug the status bar already had - `App.js` already forces
`<StatusBar style="dark" />` for the same reason - just missing the equivalent for
the nav bar, which has no such prop on a React component.

## Files

### Modified

- `App.js` - added a `Platform.OS === "android"` effect calling
  `NavigationBar.setButtonStyleAsync("dark")` once, alongside the existing forced
  `<StatusBar style="dark" />`.
- `package.json` / `yarn.lock` - added `expo-navigation-bar@~4.2.8` (not
  previously a dependency).

## How it works

`expo-navigation-bar`'s `setButtonStyleAsync` is one of the few APIs from that
package that still works with edge-to-edge enabled (background/border color
setters are no-ops with a console warning under edge-to-edge - button style is not,
it delegates to `react-native-edge-to-edge`'s `SystemBars.setStyle`, which this app
already has installed as a transitive dependency of `edgeToEdgeEnabled`). Setting it
once at app start overrides the automatic system-theme-follows behavior for good -
the nav bar icons are now always dark, matching the status bar's existing forced
style and the app's actual (always light) background.

## Backend gaps

None - client-only rendering issue.

## Known limits / follow-ups

- `expo-navigation-bar` has native code, so this only takes effect in a new native
  build (EAS build), not by reloading JS in an already-installed build - same
  caveat as every other native-module addition in this repo.
- Verified with `babel.parseSync` on `App.js` and `npx expo export --platform
  android`. Not tested on a physical device with the system theme actually set to
  dark - flagging in case the icon color still doesn't read correctly on some OEM
  skins (Samsung/Xiaomi sometimes apply their own nav bar theming on top).
- If the app ever gains its own real dark mode, this hardcoded `"dark"` needs to
  become conditional on that (not on the system theme, which the app deliberately
  ignores today).
