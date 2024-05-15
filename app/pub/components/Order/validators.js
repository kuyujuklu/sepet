const {
    orderTypes,
    orderPaymentTypes,
} = require("@/app/static-data/data");

export const validateOrderType = (orderType) => {
    if (orderType !== orderTypes.inPlace && orderType !== orderTypes.delivery)
        return "client.errors.unknown_order_type";

    return null;
};

export const validatePaymentType = (orderType) => {
    if (
        orderType !== orderPaymentTypes.cardOffline &&
        orderType !== orderPaymentTypes.cash
    )
        return "client.errors.unknown_payment_type";
    return null;
};

export const validateTableNumber = (tableNumber) => {
  console.log("table number : ", tableNumber)
    if (!(+tableNumber)) return "client.errors.table_number_is_wrong";
};

export const validateTown = (town) => {
    if (!town) return "client.errors.town_is_required";
    if (town.length < 3) return "client.errors.min_town_length_is_3";
    if (town.length > 100) return "client.errors.max_town_length_is_100";
    return null;
};

export const validateFullAddress = (fullAddress) => {
    if (!fullAddress) return "client.errors.full_address_is_required";
    if (fullAddress.length < 6) return "client.errors.min_full_address_length_is_6";
    if (fullAddress.length > 100) return "client.errors.max_full_address_length_is_100";
    return null;
};

export const validatePhone = (phone) => {
    if (!phone) return "client.errors.phone_is_required";
    if (phone.length < 8) return "client.errors.min_phone_length_is_8";
    return null;
};

export const validateOrderByPage = (order, pageNumber) => {
    switch (pageNumber) {
        case 1:
            return validateOrderType(order.orderType);
        case 2:
            if (order.orderType === orderTypes.inPlace)
                return validateTableNumber(order.tableNumber);
            if (order.orderType === orderTypes.delivery) {
                return (
                    validateTown(order.town) ||
                    validateFullAddress(order.fullAddress) ||
                    validatePhone(order.mainPhoneNumber)
                );
            }
            break;
        case 3:
            if (order.orderType === orderTypes.delivery) {
                return validatePaymentType(order.paymentType);
            }
            break;
    }
};

export const validateOrder = (order) => {
    const errors = [];

    if (!+order.pubID) return "errors.something_went_wrong";

    if (validateOrderType(order.orderType))
        errors.push(validateOrderType(order.orderType));

    if (order.orderType === orderTypes.inPlace) {
        if (validateTableNumber(order.tableNumber))
            errors.push(validateTableNumber(order.tableNumber));
    } else if (order.orderType === orderTypes.delivery) {
        if (validatePaymentType(order.paymentType))
            errors.push(validatePaymentType(order.orderType));

        if (validateTown(order.town)) errors.push(validateTown(order.town));

        if (validateFullAddress(order.fullAddress))
            errors.push(validateOrderType(order.fullAddress));

        if (validatePhone(order.mainPhoneNumber))
            errors.push(validatePhone(order.mainPhoneNumber));
    }
};
