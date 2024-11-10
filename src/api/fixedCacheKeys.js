export const fixedCacheKeys = {
    company: {
        get_company: 'company.get_company'
    },
    pubs: {
        create_pub: 'pubs.create_pub',
        update_pub: 'pubs.update_pub',
        delete_pub: 'pubs.delete_pub',
        get_all_pubs: 'pubs.get_all_pubs',
        get_pub_by_id: 'pubs.get_pub_by_id',
        upload_pub_bg: 'pubs.upload_pub_bg',
        set_shipping: 'pubs.set_shipping',
        set_shipping_availability: 'pubs.set_shipping_availability',
        set_preorder: 'pubs.set_preorder',
        set_shipping_time: 'pubs.set_shipping_time',
        set_shipping_work_hours: 'pubs.set_shipping_work_hours',
        set_shipping_free_delivery_from: 'pubs.set_shipping_free_delivery_from',
        add_courier_error: 'pubs.add_courier',
        remove_courier_error: 'pubs.remove_courier',
        set_delivery_type: 'pubs.set_delivery_type',
        set_add_commission_to_dish_prices: 'pubs.set_add_commission_to_dish_prices'
    },
    menus: {
        create_menu: 'menus.create_menu',
        update_menu: 'menus.update_menu',
        delete_menu: 'menus.delete_menu',
        move_menu_left: 'menus.move_menu_left',
        move_menu_right: 'menus.move_menu_right',
        get_all_menus: 'menus.get_all_menus',
        get_menu_by_id: 'menus.get_menu_by_id',
    },
    categories: {
        create_category: 'categories.create_category',
        update_category: 'categories.update_category',
        delete_category: 'categories.delete_category',
        move_category_left: 'categories.move_category_left',
        move_category_right: 'categories.move_category_right',
        get_all_categories: 'categories.get_all_categories',
        get_category_by_id: 'categories.get_category_by_id',
        upload_category_image: 'categories.upload_category_image',
    },
    dishes: {
        create_dish: 'dishes.create_dish',
        update_dish: 'dishes.update_dish',
        delete_dish: 'dishes.delete_dish',
        get_all_dishes: 'dishes.get_all_dishes',
        get_dish_by_id: 'dishes.get_dish_by_id',
        move_dish_left: 'dishes.move_dish_left',
        move_dish_right: 'dishes.move_dish_right',
        upload_dish_image: 'dishes.upload_dish_image',
    },
    auth: {
        registrate: 'auth.registrate',
        authenticate: 'auth.authenticate',
    },
    order :{ 
        deleteDishFromOrder: 'order.delete_dish_from_order',
        addDishToOrder: 'order.add_dish_to_order'
    },
    courier: {
        update_courier_info: 'courier.update_courier_info',
        update_courier_image: 'courier.update_courier_image',
        reserve_order: 'courier.reserve_order',
        set_order_to_completed: 'courier.set_order_to_completed',
        set_order_to_canceled: 'courier.set_order_to_canceled',
    }
}