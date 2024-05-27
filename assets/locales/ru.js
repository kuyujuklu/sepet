import { categories } from "../../src/app/static-data/data";

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
      "Этот ресторан не доставляет до вашего адреса",
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
        full_address_min_length_is_10:
          "Полный адрес должен содержать хотя бы 10 символов",
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
        label: "Имя",
      },
      phone_number: {
        label: "Номер телефона",
      },
      password: {
        label: "Пароль",
      },
      repeat_password: {
        label: "Повторите пароль",
        errors: {},
      },
    },
  },
  select_geolocation: {
    headline: "Выберите свое местоположение",
    wait_geolocation_is_loading: "Подождите, мы загружем ваше местоположение",
    pin_geolocation: "Отметить местоположение",
  },
  home_page: {
    pubs_near_you: "Рестораны возле вас",
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
    create_order_button: "Создать заказ",
  },
  create_order_page: {
    headline: "Создать заказ",
    additional_data: {
      headline: "Информация о заказе",
      inputs: {
        town: {
          label: "Район/Город",
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
      delivery_time: "Приблизительное время доставки",
      items_price: "Цена товара",
      delivery_price: "Цена доставки",
      total_sum: "Суммарно",
      create_order_button: "Создать заказ",
    },
  },
  order_page: {
    headline: "Ваши последние заказы",
    headline_no_orders: "Вы еще ничего не заказывали",
    order_card: {
      positions: "Позиций",
      rate_button: "Оценить",
      repeat_button: "Повторить",
      order_statuses: {
        not_handled: "Ожидание",
        handled: "Рассмотрен",
        preparing: "Приготовлен",
        completed: "Доставлен",
      },
    },
  },
  near_categories_page: {
    headline: "Рестораны",
  },
  categories: {
    asian: "азиатск.",
    fast_food: "фаст-фуд",
    breakfast: "завтраки",
    grill: "грилль",
    dessert: "дессерты",
    pasta: "паста",
    pancakes: "блины",
    soup: "супы",
    all: "все",
  },
};
