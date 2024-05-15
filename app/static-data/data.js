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
    Asian: {
        value: "asian",
        text: "admin.categories.category_types.asian",
    },
    FastFood: {
        value: "fast_food",
        text: "admin.categories.category_types.fast_food",
    },
    Breakfast: {
        value: "breakfast",
        text: "admin.categories.category_types.breakfast",
    },
    Grill: {
        value: "grill",
        text: "admin.categories.category_types.grill",
    },
    Dessert: {
        value: "dessert",
        text: "admin.categories.category_types.dessert",
    },
    Pasta: {
        value: "pasta",
        text: "admin.categories.category_types.pasta",
    },
    Pancakes: {
        value: "pancakes",
        text: "admin.categories.category_types.pancakes",
    },
    Soup: {
        value: "soup",
        text: "admin.categories.category_types.soup",
    },
    Other: {
        value: "other",
        text: "admin.categories.category_types.other"
    }
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
