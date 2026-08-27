export const deliveryTypes = {
  own: "own",
  deliveryService: "delivery_service"
}

export const orderPaymentTypes = {
  cardOffline: "card_offline",
  cash: "cash",
};

export const orderTypes = {
  deliveryOrderType: "delivery",
};

export const orderStatuses = {
  notHandled: "not_handled",
  handled: "handled",
  preparing: "preparing",
  atCourier: "at_courier",
  completed: "completed",
  canceled: "canceled",
};

export const currencies = [
  {
    id: 1,
    name: "MDL",
    symbol: "Lei",
  },
  {
    id: 4,
    name: "USD",
    symbol: "$",
  },
  {
    id: 2,
    name: "EUR",
    symbol: "€",
  },
  {
    id: 3,
    name: "GBP",
    symbol: "£",
  },
  {
    id: 5,
    name: "TRY",
    symbol: "₺",
  },
];
