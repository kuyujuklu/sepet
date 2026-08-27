// One catalogue of event names for the whole customer journey.
// Keep the string values stable - they are what an analytics vendor will see.
export const events = {
  screenView: "screen_view",

  addressOpened: "address_opened",
  addressSelected: "address_selected",

  sectionSelected: "section_selected",
  sectionUnavailable: "section_unavailable",

  citySelected: "city_selected",

  categorySelected: "category_selected",
  feedFilterChanged: "feed_filter_changed",
  searchOpened: "search_opened",

  dishOpened: "dish_opened",
  dishAdded: "dish_added",
  dishRemoved: "dish_removed",
  pubOpened: "pub_opened",

  basketOpened: "basket_opened",
  checkoutOpened: "checkout_opened",
  basketCleared: "basket_cleared",
  viewModeChanged: "view_mode_changed",
  orderSubmitted: "order_submitted",
  orderSucceeded: "order_succeeded",
  orderFailed: "order_failed",
  activeOrdersBarOpened: "active_orders_bar_opened",

  profileOpened: "profile_opened",
  languageChanged: "language_changed",
  supportContacted: "support_contacted",
};
