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

export const categoryTypes = {
    Burger: {
        value: "burger",
        text: "admin.categories.category_types.burger",
    },
    Pizza: {
        value: "pizza",
        text: "admin.categories.category_types.pizza",
    },
    Sushi: {
        value: "sushi",
        text: "admin.categories.category_types.sushi",
    },
    Drinks: {
        value: "drinks",
        text: "admin.categories.category_types.drinks",
    },
    Other: {
        value: "other",
        text: "admin.categories.category_types.other",
    },
};

export const orderPaymentTypes = {
    cardOffline: "card_offline",
    cash: "cash",
};

export const orderTypes = {
    delivery: "delivery",
    inPlace: "in_place",
};

export const orderStatuses = {
    notHandled: "not_handled",
    handled: "handled",
    preparing: "preparing",
    completed: "completed",
};

export const tariffs = {
    basic: "basic",
    pro: "pro",
    business: "business",
};
