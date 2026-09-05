# Clear error message when the SMS/OTP provider is down

Date: 2026-09-05
Scope: `app` only.

## What & why

Registration/login OTP requests were showing "Неизвестная ошибка" (unknown error)
whenever the SMS provider (Twilio, via backend's smsservice - `INFO_BIP_*` env vars
are dead code, the actual provider is Twilio's Verify API) rejects the send, e.g. the
account is suspended or out of quota. Confirmed the exact string:
`smserrors.ErrUnableToSendSms` on the backend is `"unable to send sms"`, which wasn't
in `convertApiErrors.js`'s map at all, so it fell through to the generic
`unknown_error` key - reads to the client like our own bug rather than "try again in
a bit", right at the point they're trying to sign up or log in.

## Files

### Modified

- `src/app/errors/appErrors.js` - new key `smsServiceUnavailable` ->
  `"errors.sms_service_unavailable"`.
- `src/app/errors/convertApiErrors.js` - maps backend's `"unable to send sms"` string
  to the new key.
- `assets/locales/ru.js` / `ro.js` / `gz.js` - `sms_service_unavailable` text: "Не
  получилось отправить SMS с кодом. Попробуйте позже или обратитесь в поддержку" (and
  ro/gz equivalents).

## How it works

Every screen that triggers an OTP send (registration, change-password) already reads
its error through `convertRespError(err.data.err)` and displays whatever key comes
back via `t()` - this only needed the map entry and the translations, no screen-level
changes. `ChangePasswordForm.jsx` gets the fix for free through the same shared
mapping function.

## Backend gaps

None - purely a client-side error-message mapping fix. The account being suspended
itself is an ops/billing issue on the SMS provider, not something the client can work
around.

## Known limits / follow-ups

- ro/gz translations are my own approximation, not reviewed by a native speaker - same
  caveat as every other ro/gz string in this repo (see CLAUDE.md).
- Not verified against a live suspended-account response - matched by the exact error
  string from the backend source, not by reproducing the real failure.
