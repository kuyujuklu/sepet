// The frontend-only "discounts & hits" category.
//
// It exists nowhere on the server: no row, no id, no `place`. It is a saved
// filter over the pub's own dishes, drawn as a category card so that managing
// discounts stops meaning "open all fifteen categories and look for the ones
// with a sale price". Because it is not a real category, nothing in here is
// ever sent to the API - every dish keeps the real menu_id / category_id it
// belongs to, and that is what the edit / delete / image-upload calls use, so
// changing a discount from this screen writes to the dish's actual category.
//
// It deliberately spans the whole pub, not just the menu currently selected on
// the pub page: "show me everything that is on offer" is the question it
// exists to answer, and a discount hiding in the second menu is exactly the
// one that gets forgotten. Each dish is labelled with the menu and category it
// came from so the wider scope never reads as a mix-up.

// Not a number, so it can never collide with a real category id in a route.
export const PROMO_CATEGORY_ID = "promo";

export const promoFilters = {
    all: "all",
    discounts: "discounts",
    hits: "hits",
};

// A sale price only counts when it is actually a discount. The panel stores 0
// for "no discount", and nothing stops it holding a stale value above the
// current price - neither is an offer.
export const hasDiscount = (dish) =>
    !!dish?.sale_price && +dish.sale_price > 0 && +dish.sale_price < +dish.price;

export const isHit = (dish) => !!dish?.is_hit;

export const isPromoDish = (dish) => hasDiscount(dish) || isHit(dish);

export const getDiscountPercent = (dish) => {
    if (!hasDiscount(dish)) return 0;

    return Math.round(((+dish.price - +dish.sale_price) / +dish.price) * 100);
};

export const matchesPromoFilter = (dish, filter) => {
    if (filter === promoFilters.discounts) return hasDiscount(dish);
    if (filter === promoFilters.hits) return isHit(dish);

    return isPromoDish(dish);
};

// Flattens the pub tree (GET /api/client/pub/{url_name}: { menus, categories,
// dishes }) into the promo dishes, each one carrying where it really lives.
//
// The biggest discount comes first - that is the number being managed here -
// then the hits that carry no discount at all, and inside each group the pub's
// own menu / category / dish order is preserved so the list does not reshuffle
// itself every time a price is edited.
export const buildPromoDishes = (pubTree) => {
    const categoriesById = {};
    (pubTree?.categories ?? []).forEach((category) => {
        categoriesById[category.id] = category;
    });

    const menusById = {};
    (pubTree?.menus ?? []).forEach((menu) => {
        menusById[menu.id] = menu;
    });

    const promoDishes = [];

    (pubTree?.dishes ?? []).forEach((dish) => {
        if (!isPromoDish(dish)) return;

        const category = categoriesById[dish.category_id];
        // A dish whose category did not come back with the tree cannot be
        // edited (the update call needs both ids), so listing it would only
        // offer a broken pencil
        if (!category) return;

        const menu = menusById[category.menu_id];
        if (!menu) return;

        promoDishes.push({
            dish,
            menuID: category.menu_id,
            categoryID: category.id,
            menuName: menu.name,
            categoryName: category.name,
            discountPercent: getDiscountPercent(dish),
            menuPlace: menu.place ?? 0,
            categoryPlace: category.place ?? 0,
            dishPlace: dish.place ?? 0,
        });
    });

    promoDishes.sort((a, b) => {
        if (a.discountPercent !== b.discountPercent) {
            return b.discountPercent - a.discountPercent;
        }
        if (a.menuPlace !== b.menuPlace) return a.menuPlace - b.menuPlace;
        if (a.categoryPlace !== b.categoryPlace) {
            return a.categoryPlace - b.categoryPlace;
        }

        return a.dishPlace - b.dishPlace;
    });

    return promoDishes;
};

// Route of the virtual category, built the same way the real ones are
export const getPromoCategoryPath = (pubID) =>
    `/admin/pub/${pubID}/edit_menu/${PROMO_CATEGORY_ID}`;
