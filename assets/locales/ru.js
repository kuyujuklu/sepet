export default {
  errors: {
    something_went_wrong: "Что-то пошло не так",
    unknown_error: "Неизвестная ошибка",
    order_below_minimum: "Сумма заказа меньше минимальной для этого заведения",
    unauthorized: "Неавторизован",
    client_with_the_same_phone_already_exists:
      "Пользователь с таким номером телефона уже существует",

    validation_error: "Ошибка валидации",
    invalid_email: "Неверный майл",
    min: "Минимум",
    max: "Максимум",
    field_must_be_number: "Поле должно быть числом",
    invalid_url_name: "Неверное url имя",
    file_is_too_large: "Файл очень большой",
    invalid_file_extension: "Неправильное расширение файла",
    file_is_not_an_image: "Файл не является изображением",
    invalid_file: "Неверный файл",
    passwords_are_not_equal: "Пароли не совпадают",
    invalid_phone: "Неверный номер телефона",
    invalid_password: "Неверный пароль",
    client_not_found: "Пользователь не найден",
    field_is_required: "Поле обязательно для заполнения",
    this_pub_is_not_delivering_in_your_area:
      "В данный момент этот ресторан не доставляет до вашего адреса",
    in_this_time_delivery_not_working: "В это время доставка не работает",
    too_many_sessions: "Вы отправляете запрос на регитрацию слишком часто",
    invalid_session_validation_number: "Неверный код проверки",

    validation: {
      client: {
        name_is_required: "Имя обязательно для заполнения",
        min_name_length_is_3: "Имя должно содержать минимум 3 символа",
        max_name_length_is_100: "Имя должно содержать максимум 100 символов",

        password_is_required: "Пароль не может быть пустым",
        min_password_length_is_6: "Минимум 6 символов",
        min_password_length_is_100: "Максимум 100 символов",
      },
      order: {
        town_min_length_is_3: "Название города должно содержать мин. 3 символа",
        town_max_length_is_100:
          "Название города должно содержать максимум 100 символов",
        full_address_min_length_is_6:
          "Полный адрес должен содержать хотя бы 6 символов",
        full_address_max_length_is_100:
          "Полный адрес должен содержать макс 100. символов",
      },
    },
  },
  auth: {
    logout: "Выйти из аккаунта",
    guest_account: "Аккаунт гостя",
    login_as_guest: "Войти как гость",
    headline: "Авторизация",
    pass_validation_code_from_sms: "Введите код из смс",
    go_back: "Вернуться",
    send_again: "Отправить снова",
    submit: "Подтвердить",
    go_to_registration: "Нет аккаунта? Регистрация",
    go_to_change_password: "Забыли пароль? Сменить",
    go_to_delete_account: "Хотите удлить свой аккаунт? Кликните здесь",
    privacy_policy_text:
      "Продолжая пользоваться этим приложением вы соглашаетесь с",
    privacy_policy_link: "политикой конфиденциальности",
    inputs: {
      phone_number: {
        label: "Номер телефона",
      },
      password: {
        label: "Пароль",
      },
    },
  },
  registration: {
    headline: "Регистрация",
    pass_validation_code_from_sms: "Введите код из смс",
    go_back: "Вернуться",
    send_again: "Отправить снова",
    submit: "Подтвердить",
    go_to_auth: "Уже есть аккаунт? Авторизация",
    inputs: {
      name: {
        label: "Имя Фамилия",
      },
      phone_number: {
        label: "Номер телефона",
      },
      password: {
        label: "Пароль",
      },
      repeat_password: {
        label: "Повторите пароль",
      },
    },
  },
  change_password: {
    headline: "Сменить пароль",
    inputs: {
      new_password: {
        label: "Новый пароль",
      },
      repeat_password: {
        label: "Повторите пароль",
      },
    },
  },
  phone_validation_number_input: {
    headline: "Введите код из СМС",
    go_back: "Вернуться",
    send_again: "Отравить еще раз",
  },
  select_geolocation: {
    title: "Адрес доставки",
    subtitle: "Выберите сохранённый адрес или добавьте новый — курьер приедет по нему",
    current_section: "Текущее местоположение",
    use_current: "Использовать и продолжить",
    no_saved_title: "Сохранённых адресов пока нет",
    no_saved_text: "Добавьте адрес — в следующий раз его можно будет выбрать в один тап",
    add_address_inputs_hint: "Как называется это место? Улица и номер дома нужны курьеру",
    point_on_map: "Точка на карте выбрана",
    change_point: "Изменить",
    detecting_address: "Определяем адрес…",
    save_address: "Сохранить адрес",
    saved_addresses: "Сохраненные адреса",
    headline: "Выберите локацию",
    continue: "Далее",
    back: "Назад",
    add_new_address: "Добавить адрес доставки",
    add_address_inputs_headline: "Укажите свой адрес",

    select_by_yourself_button: "Выбрать самому",
    wait_geolocation_is_loading: "Подождите, мы загружаем ваше местоположение",
    pin_geolocation: "Добавить новый адрес",
    we_cannot_load_your_geolocaiton:
      "Мы не смогли загрузить ваше местоположение, выберите его сами",
    change_geolocation: "Сменить локацию",
  },
  sections: {
    headline: "Что закажем?",
    subheadline:
      "Выберите раздел — адрес доставки укажете позже, при оформлении заказа",
    coming_soon: "Скоро",
    coming_soon_alert: "Этот раздел скоро откроется",
    food: {
      title: "Еда",
      subtitle: "Блюда из ресторанов и кафе рядом с вами",
      feed_subtitle: "Выгодные блюда из ресторанов рядом — заказ в пару касаний",
      all_pubs_label: "Все рестораны",
    },
    flowers: {
      title: "Цветы",
      subtitle: "Букеты и композиции с доставкой",
      feed_subtitle: "Букеты из цветочных рядом — доставим сегодня",
      all_pubs_label: "Все цветочные",
    },
    groceries: {
      title: "Продукты",
      subtitle: "Продуктовые магазины и всё для дома",
      feed_subtitle: "Продукты из магазинов рядом",
      all_pubs_label: "Все продуктовые",
    },
  },
  city_picker: {
    headline: "В каком городе вы находитесь?",
    subheadline:
      "Нужно только чтобы показать заведения рядом. Точный адрес укажете при оформлении заказа",
    open_settings: "Разрешить доступ к геолокации в настройках",
    detecting: "Определяем ваше местоположение…",
    select_manually: "Выбрать город вручную",
  },
  header: {
    near_you: "Рядом с вами",
    approximate_hint: "Определено по геолокации · нажмите, чтобы уточнить",
    set_address: "Указать адрес доставки",
    specify_address: "уточнить адрес",
  },
  profile: {
    title: "Профиль",
    orders: "Мои заказы",
    change_address: "Изменить адрес",
    language: "Язык интерфейса",
    additional_settings: "Дополнительные настройки",
    notifications: "Уведомления",
    support: "Поддержка",
    privacy: "Приватность",
    analytics_consent: "Аналитика",
    analytics_consent_hint: "Помогает нам улучшать приложение",
    privacy_policy: "Политика конфиденциальности",
  },
  notifications_page: {
    title: "Уведомления",
    empty: "Пока нет уведомлений",
    clear: "Очистить историю",
  },
  home_page: {
    select_another_geolocation: "Выбрать другую локацию",
    no_available_pubs_for_location:
      "К сожалению, мы пока не доставляем до вашего адреса :(",
    pubs_near_you: "Рестораны возле вас",
    pub_is_closed: "Закрыто. Время работы",
    active_orders: "Активные заказы",
    top_dishes: {
      title: "Хиты продаж",
      subtitle: "Выгодные блюда из ресторанов рядом — заказ в пару касаний",
      deals_title: "Горячие предложения",
      deals_subtitle: "Собрали для вас самые выгодные позиции",
      filter_top: "Хиты",
      filter_deals: "Скидки",
      filter_pubs: "Заведения",
      filters_button: "Фильтровать",
      filters_sheet_subtitle: "Категория или условия доставки",
      filters_delivery_group: "Доставка",
      filter_free_delivery: "Бесплатная доставка",
      sort_button: "Сортировать",
      sort_sheet_title: "Сортировать",
      sort_rating: "По рейтингу",
      sort_distance: "По расстоянию",
      sort_speed: "По скорости доставки",
      search_placeholder: "Поиск блюд",
      search_cancel: "Отмена",
      search_prompt: "Начните вводить, чтобы найти блюдо",
      search_no_results: "Ничего не найдено",
      search_accessibility_label: "Поиск",
      hit_badge: "Хит",
      closed: "Закрыто",
      sold_out: "Нет в наличии",
      no_dishes: "Пока нет блюд, доступных для заказа",
      no_deals: "Сейчас нет блюд со скидкой",
      go_to_basket: "В корзину",
      no_dishes_in_category: "В этой категории рядом пока нет блюд",
      show_all_dishes: "Показать все блюда",
    },
  },
  pub_info_page: {
    is_open: "Открыто",
    phone: "Телефон",
    close: "Закрыть",
    empty_menu: "В этом меню пока нет блюд",
    dishes_count: "Блюд: {{value}}",
    pub_header: {
      address: "Адрес",
      additional_info: "Дополнительная информация",
    },
  },
  view_modes: {
    as_list: "Списком",
    by_categories: "По категориям",
  },
  basket_page: {
    unavailable_dishes:
      "Некоторых позиций сейчас нет в наличии — удалите их, чтобы оформить заказ",
    min_order_left:
      "Минимальная сумма заказа — {{min}}. Добавьте ещё на {{amount}}",
    subtotal: "Подытог",
    delivery: "Доставка",
    delivery_free: "Бесплатно",
    total: "Итого",
    free_delivery_left: "До бесплатной доставки не хватает {{amount}}",
    positions: "Позиций: {{value}}",
    minutes: "мин",
    open_pub: "В меню",
    add_more: "Дозаказать",
    per_item: "за штуку",
    clear: "Очистить",
    clear_confirm: "Очистить корзину?",
    clear_ok: "Очистить",
    not_available_for_delivery:
      "Это заведение сейчас не доставляет по вашему адресу",
    empty_title: "Корзина пуста",
    empty_text: "Добавьте блюда — и они появятся здесь",
    empty_button: "Выбрать блюда",
    remove_dish: {
      title: "Удалить позицию из корзины?",
      cancel: "Оставить",
      confirm: "Удалить",
    },
    headline: "Корзина",
    empty: "Пустая",
    create_order_button: "Дальше",
    pub_is_closed_error:
      "Этот ресторан сейчас закрыт попробуйте позже или сделайте заказ в другом",
    go_to_registration: "Чтобы продолжить - зарегистрируйтесь"
  },
  basket_popup: {
    another_pub_warning:
      "Вы пытаетесь добавить товар из другого ресторана.  Корзина будет очищена.",
    cancel_button: "Отмена",
    ok_button: "Ok",
  },
  dish_popup: {
    sold_out: "Этой позиции сейчас нет в наличии",
    in_basket: "В корзине: {{value}}",
    back: "Назад",
  },
  create_order_page: {
    address: {
      current: "Заказ доставим сюда",
      unknown: "Адрес не определён",
      change: "Изменить адрес",
      saved_title: "Сохранённые адреса",
      no_saved: "Сохранённых адресов пока нет — добавьте первый на карте",
      add_new: "Добавить новый адрес",
      title: "Куда доставить",
      hint: "Адрес нужен только сейчас — курьер приедет по нему",
      save_toggle: "Сохранить адрес для будущих заказов",
    },
    contacts: {
      title: "Контакты",
    },
    comment: {
      title: "Комментарий к заказу",
    },
    order: {
      title: "Ваш заказ",
    },
    headline: "Создать заказ",
    additional_data: {
      fill_inputs: "Заполните обязательные поля",
      empty_basket: "В корзине нет товаров",
      no_location: "Мы не знаем, куда доставлять — укажите адрес",
      approximate_location:
        "Мы показывали заведения по примерному местоположению. Проверьте адрес доставки ниже.",
      headline: "Информация о заказе",
      inputs: {
        town: {
          label: "Город или нас. пункт",
        },
        full_address: {
          label: "Полный адрес",
        },
        main_phone_number: {
          label: "Основной телефон",
        },
        second_phone_number: {
          label: "Дополнительный телефон",
        },
        comments: {
          label: "Комментарии к заказу",
        },
        payment_type: {
          label: "Тип оплаты",
          values: {
            cash: "Наличными",
            card_offline: "Переводом курьеру",
          },
        },
      },
      delivery_time: "Время доставки",
      items_price: "Сумма товаров",
      delivery_price: "Цена доставки",
      total_sum: "Сумма к оплате",
      create_order_button: "Создать заказ",
    },
  },
  order_page: {
    headline: "Ваши заказы",
    headline_no_orders: "Вы еще ничего не заказывали",
    no_orders_text:
      "Здесь появятся ваши заказы — любой из них можно будет повторить в одно касание",
    no_orders_button: "Перейти к блюдам",
    order_card: {
      unable_to_repeat_order: "К сожалению мы не можем повторить этот заказ",
      order_is_not_completed_alert: "Заказ еще не доставлен",
      positions: "Позиций",
      rate_button: "Оценить",
      repeat_button: "Повторить",
      order: "Заказ",
      order_statuses: {
        not_handled: "Обработка",
        handled: "Рассмотрен",
        preparing: "Готовится",
        at_courier: "У курьера",
        completed: "Доставлен",
        canceled: "Отменен",
      },
    },
  },
  near_categories_page: {
    nothing_found: "Здесь пока ничего нет — попробуйте другую категорию",
  },
  internet: {
    no_internet_title: "Нет соединения с интернетом",
    no_internet_text: "Проверьте подключение и попробуйте ещё раз",
  },
  categories: {
    // The per-slug names used to live here; they come from
    // GET /api/client/category-types now (see shared/hooks/useCategoryTypes).
    // What is left is the chips that are not a category type.
    all: "Всё",
    all_publishments: "Все заведения",
    show_all: "Ещё",
    sheet_title: "Категории",
  },
  order_info_page: {
    order: "Заказ",
    all_changes_from_tech: "Все изменения в заказе делаются только через",
    support: "поддержку",
    dishes_title: "Состав заказа",
    no_dishes: "Не удалось загрузить состав заказа",
  },
  address_info: {
    your_address: "Ваш адрес",
  },
  delete_account_popup: {
    headline: "Удалить мой аккаунт",
    main_text:
      "Внимание! Удаление аккаунта Sepet, означает удаление всех данных о вас, такие как: ваши заказы, ваше имя, емейл, телефон, адреса доставок, выбранные местоположения, оценки ресторанов, история создания заказов, информация о вашем устройстве, и кукис.",
    subscription: "Это действие необратимо.",
    back: "Назад",
    delete: "Удалить",
  },
  pub_card: {
    free_delivery_from: "Бесплатная доставка от"
  },
  pub_not_available_for_delivery: {
    title: "Заказ не получится оформить",
    pub_is_not_open: "Данное заведение сейчас закрыто или вы находитесь вне зоны доставки этого заведения",
    choose_another_pub: "Выбрать другое заведение",
    change_geolocation: "Изменить местоположение"
  },
  version: {
    version_expired_message: "Кажется версия вашего приложения устарела :(",
    update: "Обновить"
  }

};
