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
    Flowers: {
        value: "flowers",
        text: "admin.categories.category_types.flowers",
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
    // Pancakes: {
    //     value: "pancakes",
    //     text: "admin.categories.category_types.pancakes",
    // },
    Soup: {
        value: "soup",
        text: "admin.categories.category_types.soup",
    },
    Alcohol: {
        value: "alcohol",
        text: "admin.categories.category_types.alcohol",
    }, 
    EastFood: {

        value: "east_food",
        text: "admin.categories.category_types.east_food",
    }, 
    Flour: {

        value: "flour",
        text: "admin.categories.category_types.flour",
    }, 
    HomeFood: {

        value: "home_food",
        text: "admin.categories.category_types.home_food",
    }, 
    Kebab: {

        value: "kebab",
        text: "admin.categories.category_types.kebab",
    }, 
    Salad: {

        value: "salad",
        text: "admin.categories.category_types.salad",
    }, 
    Snacks: {

        value: "snacks",
        text: "admin.categories.category_types.snacks",
    }, 
    Meat: {

        value: "meat",
        text: "admin.categories.category_types.meat",
    }, 
    Other: {
        value: "other",
        text: "admin.categories.category_types.other"
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

export const genders = {
    male: "male",
    female: "female"
}

export const orderStatuses = {
    notHandled: "not_handled",
    handled: "handled",
    atCourier: "at_courier",
    preparing: "preparing",
    completed: "completed",
    canceled: "canceled"
};

export const tariffs = {
    basic: "basic",
    pro: "pro",
    business: "business",
};

export const deliveryTypes = {
    own: "own",
    deliveryService: "delivery_service"
}