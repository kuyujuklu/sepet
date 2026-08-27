# Push notification copy for order statuses — backend-owned, no client fix possible

Date: 2026-08-27

## What & why

Client asked to change the text of push notifications sent on order status changes
(gave draft copy for `not_handled`, `preparing`, `at_courier`, `completed`,
`canceled`), or for suggested improvements.

## Investigation - why this can't be done here

Traced the whole push pipeline. Every `Notifications.*` call in the app lives in one
file, `src/features/store/notifications/NotificationHandler.jsx` (wired into
`App.js`), and none of them is `scheduleNotificationAsync`/`presentNotificationAsync`
- the client never manufactures a notification with its own text, only listens for
ones that already arrived. It registers an Expo push token with the backend
(`src/shared/api/notifications-api/subscribe-token.js` POSTs
`{phone, token, lang}` to `/api/client/notifications/subscribe`) and displays
whatever `title`/`body` the payload already contains, verbatim - confirmed in
`src/shared/utils/pushNotificationsHistory.js`'s `appendNotificationToHistory`,
which stores `request.content.title`/`.body` as-is with no rewriting anywhere in
between. `order-utils.js`'s `getOrderStatusText` (the in-app status badge copy, e.g.
"У курьера") is a completely separate thing - never read by the notification code,
and not the wording the client wants for a push anyway.

**Conclusion: push notification text is decided entirely by whichever backend
service triggers the send on an order-status transition. There is no client-side
hook to intercept or rewrite it - this needs a backend change, not an app change.**

## Proposed copy (Russian drafts, for the backend team)

Refined the client's own drafts for push-notification length/tone, and added
`handled`, which their list skipped:

| Status | Proposed text |
|---|---|
| `not_handled` | Заказ №{id} принят и отправлен в {pub}. Обычно подтверждение занимает 5–10 минут. |
| `handled` *(not in the client's list)* | {pub} подтвердил(о) ваш заказ №{id} и скоро начнёт готовить. |
| `preparing` | Ваш заказ готовится! Обычно это занимает около {N} минут. |
| `at_courier` | Курьер уже в пути к вам 🚴 |
| `completed` | Заказ доставлен! Спасибо, что выбрали Sepet 🙏 Будем рады узнать, понравилось ли вам — оцените заказ в приложении. |
| `canceled` | К сожалению, заказ №{id} отменён — возникли технические сложности на стороне заведения или доставки. Приносим извинения и постараемся всё исправить в следующий раз. |

Notes for whoever implements this on the backend:

- `{id}`/`{pub}`/`{N}` are placeholders for order id, pub name, and a delivery-time
  estimate. The backend already has the first two on the order; for `{N}`, the pub's
  stated delivery-time-from (`pub.shipping.shipping_time_from`, resolved via
  `getPubWorkHours` in `src/shared/utils/pub.js` and consumed in
  `src/shared/api/pubs/pubsApi.js`) is exactly the "minimum value from the pub's
  delivery time" the client asked for on `preparing`. Static text without
  interpolation is a fine first cut if templating isn't feasible immediately.
- `completed`'s copy deliberately nudges toward rating the order in-app - pairs with
  the rating-button fix in `changes/2026-08-27-order-info-screen-cleanup.md`.
- Russian only. If the backend can localize by the `lang` it already receives on
  token subscription, `ro`/`gz` versions would need the same "not native-checked"
  caveat every other `ro`/`gz` string in this repo carries - ask a native speaker
  before shipping translated push copy, not just this app's usual approximate
  translations.
- Emoji (🚴🙏) are optional flourishes on `at_courier`/`completed` only - easy to
  drop if the client doesn't want them.

## Backend gaps

- **API change needed**: push `title`/`body` for order-status transitions need to
  be updated to the copy above (or the client's own revision of it) wherever the
  backend currently composes them. This client repo has no way to influence that
  text at all.
