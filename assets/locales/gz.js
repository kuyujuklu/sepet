export default {
  errors: {
    something_went_wrong: "Naşey sa gitti diil dooru?",
    unknown_error: "Dııl belli  yannışık",
    unauthorized: "Neavtorizovan",
    client_with_the_same_phone_already_exists: "Kullanan bu nomeri var",
    validation_error: "Yannışlık validaţiyada",
    invalid_email: "Diil dooru mail",
    min: "Minimum",
    max: "Maksimum",
    field_must_be_number: "Sayı lääzım olsun",
    invalid_url_name: "Diil dooru ad",
    file_is_too_large: "pek büük fayıl",
    invalid_file_extension: "Diil dooru fayılın tipi",
    file_is_not_an_image: "Fayıl diil resim",
    invalid_file: "Diil dooru fayıl",
    passwords_are_not_equal: "Parollär birleşmerlär",
    invalid_phone: "Diil dooru telefonun nomeri",
    invalid_password: "Diil dooru parol",
    client_not_found: "Kullanan bulunmadı",
    field_is_required: "Masuz doldurmak için",
    this_pub_is_not_delivering_in_your_area:
      "Bu vakıt bu restoran götürmeer sizin adrezınıza",
    in_this_time_delivery_not_working: "Bu vakıt götürmäk işlämeer",
    too_many_sessions: "Siz  pek sık yollěrsınız istemäk",
    invalid_session_validation_number: "Diil dooru control etmäk kodu",

    validation: {
      client: {
        name_is_required: "Ad maasuz doldurmak için",
        min_name_length_is_3: "Adınız lääzım olsun minimum 3 sımvollan",
        max_name_length_is_100: "Adınız lääzım olsun maksimum 100  sımvollan",
        password_is_required: "Parol diil lääzım olsun boş",
        min_password_length_is_6: "Minimum 6 sımvol",
        min_password_length_is_100: "Maksimum 100 sımvol",
      },
      order: {
        town_min_length_is_3: "Kasabanın adı lääzım olsun minimum 3 sımvol",
        town_max_length_is_100:
          "Kasabanın adı lääzım olsun maksimum 100 sımvol",
        full_address_min_length_is_10:
          "Bütün adresı minimum 10 simvol lääzım olsun",
        full_address_max_length_is_100:
          "Bütün adresı maksimum 100 simvol lääzım olsun",
      },
    },
  },
  auth: {
    logout: "Akaunttan çıkış",
    headline: "Avtorizaţiya",
    guest_account: "Musaafir akauntu",
    login_as_guest: "Girmää registratiyasız",
    pass_validation_code_from_sms: "Yazın SMS kodu",
    go_back: "Geeri dön",
    send_again: "Enidän yolla",
    submit: "Ileri",
    go_to_registration: "Yok akaunt?  Registraţiya",
    go_to_change_password: "Unuttunuz parolü? Diiştirmää",
    go_to_delete_account: "Isteersiniz akauntu silmää? Basınız burayı",
    privacy_policy_text:
      "Продолжая пользоваться этим приложением вы соглашаетесь с",
    privacy_policy_link: "политикой конфиденциальности",
    inputs: {
      phone_number: {
        label: "Telefonun nomeri",
      },
      password: {
        label: "Parol",
      },
    },
  },
  registration: {
    headline: "Registraţiya",
    pass_validation_code_from_sms: "Yazın SMS kodu",
    go_back: "Geeri dön",
    send_again: "Enidän yolla",
    submit: "Hazır",
    go_to_auth: "Var akaunt?  Avtorizaţiya",
    inputs: {
      name: {
        label: "Adı Soyadı",
      },
      phone_number: {
        label: "Telefonun nomeri",
      },
      password: {
        label: "Parol",
      },
      repeat_password: {
        label: "Tekrarlayın parolu",
      },
    },
  },
  change_password: {
    headline: "Diiştirin parolu",
    inputs: {
      new_password: {
        label: "Eni parol",
      },
      repeat_password: {
        label: "Tekrarlayın parolu",
      },
    },
  },
  phone_validation_number_input: {
    headline: "Yazın SMS kodu",
    go_back: "Geeri dön",
    send_again: "Enidän yolla",
  },
  select_geolocation: {
    saved_addresses: "Yazılı adreslar",
    headline: "Ayırın lokaţıyayı",

    continue: "Ileri",
    back: "Geeri",
    add_new_address: "Eni adresi ekelemää",
    add_address_inputs_headline: "Yazın sizin adresinizi",

    select_by_yourself_button: "Ayırın kendiniz",
    wait_geolocation_is_loading: "Bekläyin , biz ükleriz sizin adrezinizi",
    pin_geolocation: "Ekle eni adres",
    we_cannot_load_your_geolocaiton:
      "Biz  bulamadık sizin adrezinizi, ayırın noktayı kendiniz",
    change_geolocation: "Diiştirin lokaţiyayı",
  },
  home_page: {
    select_another_geolocation: "Ayırın eni lokaţıyayı",
    no_available_pubs_for_location: "Biz etişämeeriz sizä",
    pubs_near_you: "Restorannar sizin yanınızda",
    pub_is_closed: "Kapalı. İş zamanı.",
  },
  pub_info_page: {
    pub_header: {
      address: "Adres",
      additional_info: "Bilgi",
    },
  },
  basket_page: {
    headline: "Sepet",
    empty: "Boş",
    create_order_button: "Ileri",
    pub_is_closed_error:
      "Restoran kapalı, savaşın soran, yada yapın sımarlamak başka restoranda",
    go_to_registration: "Чтобы продолжить - зарегистрируйтесь"
    },
  basket_popup: {
    another_pub_warning:
      "Siz savaşěrsınız yapmaa sımarlamak başka erdän. Tamannamaa? Sepet boşalacek!!!",
    cancel_button: "Bırak",
    ok_button: "Ok",
  },
  dish_popup: {
    back: "Hazır",
  },
  create_order_page: {
    headline: "Eni sımarlamak",
    additional_data: {
      headline: "Sımarlamanın bilgileri",
      inputs: {
        town: {
          label: "Kasaba",
        },
        full_address: {
          label: "Adres",
        },
        main_phone_number: {
          label: "Baş telefon",
        },
        second_phone_number: {
          label: "İkinci telefon",
        },
        comments: {
          label: "Sımarlamak komentları",
        },
        payment_type: {
          label: "Ödeşmäk tipi",
          values: {
            cash: "Paraylan",
            card_offline: "Kuryera karda",
          },
        },
      },
      delivery_time: "Götürmäk vakıdı",
      items_price: "Yapı paası",
      delivery_price: "Götürmäk paası",
      total_sum: "Toplam sımarlamak paası",
      create_order_button: "Eni sımarlamak yap",
    },
  },
  order_page: {
    headline: "Sizin sımarlamanız",
    headline_no_orders: "Bişey sımarlamadınız",
    order_card: {
      unable_to_repeat_order: "Biz yakışměěr  tekrarlayalım",
      order_is_not_completed_alert: "Sımarlamak taa etişmedi",
      positions: "Oluş",
      rate_button: "Yıldız ver",
      repeat_button: "Tekrarla",
      order: "Sımarlamak",
      order_statuses: {
        not_handled: "Eni sımarış",
        handled: "Etişti restorana",
        preparing: "Hazırlanêêr",
        at_courier: "Kuryerda",
        completed: "Etişti",
        canceled: "Geeri çevirildi",
      },
    },
  },
  near_categories_page: {
    headline: "Restorannar",
    pub_is_closed: "Kapalı. İş zamanı.",
  },
  categories: {
    asian: "Aziatsk",
    flowers: "Çiçeklär",
    fast_food: "Fast-fud",
    breakfast: "Sabaa ekmä",
    grill: "Gril",
    dessert: "Tatlılıklar",
    pasta: "Makarina",
    pancakes: "Lalangı",
    soup: "Borçlar",
    alcohol: "İçmeklär",
    east_food: "Vostç. kuhnä",
    flour: "Undan imeklär",
    home_food: "Ev imekleri",
    kebab: "Kebab",
    salad: "Eşillik",
    snacks: "Zakuska",
    meat: "Lokma",
    all_publishments: "Hepsi restorannar",
  },

  order_info_page: {
    order: "Sımarlamak",
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
  }
};
