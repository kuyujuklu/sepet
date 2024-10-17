export default {
  errors: {
    something_went_wrong: "Что-то пошло не так",
    unknown_error: "Неизвестная ошибка",
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
      in_this_time_delivery_not_working:
      "В это время доставка не работает",
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
    headline: "Авторизация",
    pass_validation_code_from_sms: "Введите код из смс",
    go_back: "Вернуться",
    send_again: "Отправить снова",
    submit: "Подтвердить",
    go_to_registration: "Нет аккаунта? Регистрация",
    go_to_change_password: "Забыли пароль? Сменить",
    go_to_delete_account: "Хотите удлить свой аккаунт? Кликните здесь",
    privacy_policy_text: "Продолжая пользоваться этим приложением вы соглашаетесь с",
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
      new_password:{ 
        label: "Новый пароль"
      },
      repeat_password: {
        label: "Повторите пароль"
      }
    }
  },
  phone_validation_number_input: {
    headline: "Введите код из СМС",
    go_back: "Вернуться",
    send_again: "Отравить еще раз"
  },
  select_geolocation: {
    saved_addresses: "Сохраненные адреса",
    headline: "Выберите локацию",
    
    select_by_yourself_button: "Выбрать самому",
    wait_geolocation_is_loading: "Подождите, мы загружаем ваше местоположение",
    pin_geolocation: "Добавить новый адрес",
    we_cannot_load_your_geolocaiton:
      "Мы не смогли загрузить ваше местоположение, выберите его сами",
    change_geolocation:"Сменить локацию",
  },
  home_page: {
    select_another_geolocation: "Выбрать другую локацию",
    no_available_pubs_for_location: "К сожалению, мы пока не доставляем до вашего адреса :(",
    pubs_near_you: "Рестораны возле вас",
    pub_is_closed: "Закрыто. Время работы",
  },
  pub_info_page: {
    pub_header: {
      address: "Адрес",
      additional_info: "Дополнительная информация",
    },
  },
  basket_page: {
    headline: "Корзина",
    empty: "Пустая",
    create_order_button: "Дальше",
    pub_is_closed_error: "Этот ресторан сейчас закрыт попробуйте позже или сделайте заказ в другом",
  },
  basket_popup: {
    another_pub_warning:
      "Вы пытаетесь добавить товар из другого ресторана.  Корзина будет очищена.",
    cancel_button: "Отмена",
    ok_button: "Ok",
  },
  dish_popup: {
    back: "Назад",
  },
  create_order_page: {
    headline: "Создать заказ",
    additional_data: {
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
            card_offline: "Картой курьеру",
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
    headline: "Рестораны",
    pub_is_closed: "Закрыто. Время работы",
  },
  categories: {
    asian: "азиатск.",
    flowers: "цветы",
    fast_food: "фаст-фуд",
    breakfast: "завтраки",
    grill: "грилль",
    dessert: "дессерты",
    pasta: "паста",
    pancakes: "блины",
    soup: "супы",
    alcohol: "алкоголь",
    east_food: "восточная кухня",
    flour: "мучные",
    home_food: "домашняя еда",
    kebab: "кебаб",
    salad: "салаты",
    snacks: "закуски",
    meat: "мясо",
    all_publishments: "Все заведения",
  },
  order_info_page: {
    order: "Заказ"
  },
  address_info: {
    your_address: "Ваш адрес",

  }
};
