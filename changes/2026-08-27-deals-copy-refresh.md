# "Скидки" chip label + new deals headline copy

Date: 2026-08-27

## What & why

Pure copy change to the discount/deals view of the Home feed: the sort chip said "Со
скидкой", shortened to "Скидки"; the headline shown while that view is active said
"Товары со скидкой" / "Цены ниже обычных — успейте оформить заказ", replaced with the
client's own proposed copy: "Горячие предложения" / "Собрали для вас самые выгодные
позиции".

## Files

### Modified

- `assets/locales/{ru,ro,gz}.js` — `home_page.top_dishes.{filter_deals,deals_title,
  deals_subtitle}`. No code changes - `TopDishesFilters.jsx`/`TopDishesList.jsx` already
  render these exact keys via `t(...)`. ro/gz are my own translations, not
  native-checked, same caveat as every other ro/gz string in this codebase.
- `home_page.top_dishes.no_deals` (the empty-state message, "Сейчас нет блюд со скидкой")
  was deliberately left alone - different sentence for a different situation, not part of
  the ask.

## Backend gaps

None.

## Known limits / follow-ups

- Verified with a babel parse of all three locale files; not opened on a device (text-only
  change through an already-working render path, so low risk).
