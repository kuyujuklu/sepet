import { categories } from "../../src/app/static-data/data";

export default {
  errors: {
    something_went_wrong: "naseysa gitti diil dooru",
    unknown_error: "Naseysa beklenmeyen oldu",
    unauthorized: "Taninmadik kisi",
    client_with_the_same_phone_already_exists:
      "Kullanici hep bola bir telefonnan sistemda var",

    validation_error: "Gecersiz yazilar",
    invalid_email: "Gecersiz e-mail",
    min: "En az",
    max: "En cok",
    field_must_be_number: "Bu yazim yeri laazim olsun rakam",
    invalid_url_name: "Gecersiz url ad",
    file_is_too_large: "Document pek buyuk",
    invalid_file_extension: "Gecersiz documendin formati",
    file_is_not_an_image: "Document resim diil",
    invalid_file: "Gecersiz document",
    passwords_are_not_equal: "Sifre kodu tekrari uymer",
    invalid_phone: "Telefon numarasi diil dooru",
    invalid_password: "Sifre kodu diil dooru",
    client_not_found: "Kullanici bulunmadi",
    field_is_required: "Bu yazi yeri bos kalamaz",
    this_pub_is_not_delivering_in_your_area:
      "Bu restoran gondermer sizin adresinize kadar",
    validation: {
      client: {
        name_is_required: "Bu yazi yeri bos kalamaz",
        min_name_length_is_3: "Ad yazi yerinde en az 3 harf yaziniz",
        max_name_length_is_100: "Ad yazi yerinde en cok 100 harf laazim olsun",

        password_is_required: "Sifre kodu bos kalamaz",
        min_password_length_is_6: "En az 6 harf kulaniniz",
        min_password_length_is_100: "En cok 100 harf kullaniniz",
      },
      order: {
        town_min_length_is_3: "Casaba adinda en az 3 harf kullaniniz",
        town_max_length_is_100:
          "Casaba adinda en cok 100 harf kullaniniz",
        full_address_min_length_is_10:
          "Tamanli adres en az 3 harf laazim olsun",
        full_address_max_length_is_100:
          "Tamanli adres en cok 100 harf laazim olsun",
      },
    },
  },
  auth: {
    logout: "Cikis yap",
    headline: "Giris yap",
    pass_validation_code_from_sms: "Girin sms'ten kodu",
    go_back: "Geri don",
    send_again: "Eniden gonderin",
    submit: "Hazir",
    go_to_registration: "Yok kullanici? Yeni kullanici ac",
    inputs: {
      phone_number: {
        label: "Telefon numarasi",
      },
      password: {
        label: "Sifre kodu",
      },
    },
  },
  registration: {
    headline: "Yeni kullanici ac",
    pass_validation_code_from_sms: "Sms'ten kodu girin",
    go_back: "Geri don",
    send_again: "Eniden gonder",
    submit: "Hazir",
    go_to_auth: "Kullanici acik var? Giris yap",
    inputs: {
      name: {
        label: "Ad",
      },
      phone_number: {
        label: "Telefon numarasi",
      },
      password: {
        label: "Sifre kodu",
      },
      repeat_password: {
        label: "Tekrar sifre kodu girin",
        errors: {},
      },
    },
  },
  select_geolocation: {
    headline: "Kendi bulunan yeri ayirin",
    wait_geolocation_is_loading: "Bekleyin, sizin bulunan yeri ukleeriz",
    pin_geolocation: "Benim bulunan yeri belert",
  },
  home_page: {
    pubs_near_you: "Restorantlar sizin yaninizda",
  },
  pub_info_page: {
    pub_header: {
      address: "Adres",
      additional_info: "Ekleme bilgi",
    },
  },
  basket_page: {
    headline: "Sepet",
    empty: "Bos",
    create_order_button: "Yeni siparis yap",
  },
  basket_popup: {
    clear_warning: "basket_popup.another_pub_warning",
  },
  create_order_page: {
    headline: "Yeni siparis yap",
    additional_data: {
      headline: "Siparis bilgileri",
      inputs: {
        town: {
          label: "Maala/Casaba",
        },
        full_address: {
          label: "Tamanli adres",
        },
        main_phone_number: {
          label: "Cep telefon numarasi",
        },
        second_phone_number: {
          label: "Ekleme telefon numarasi",
        },
        comments: {
          label: "Siparisin komentlari",
        },
        payment_type: {
          label: "Odeme tipi",
          values: {
            cash: "Cep parasi",
            card_offline: "Kart'lan kuriyere",
          },
        },
      },
      delivery_time: "Yaklasik teslim vakidi",
      items_price: "Yapinin para tutari",
      delivery_price: "Teslim tutari",
      total_sum: "Toplam",
      create_order_button: "Yeni siparis yap",
    },
  },
  order_page: {
    headline: "Sirin siparisler",
    headline_no_orders: "Siz bir sey taa siparis vermediniz",
    order_card: {
      positions: "Yapi sayisi",
      rate_button: "Yildiz ver",
      repeat_button: "Tekrarla",
      order: "Siparis",
      order_statuses: {
        not_handled: "Yeni",
        handled: "Hazirlaniyor",
        preparing: "Kuryerda",
        completed: "Teslim oldu",
      },
    },
  },
  near_categories_page: {
    headline: "Restoranlar",
  },
  categories: {
    asian: "Aziya. y.",
    fast_food: "hizli-yemek",
    breakfast: "sabaalik",
    grill: "kizartma",
    dessert: "tatlilik",
    pasta: "makarina",
    pancakes: "sut pazisi",
    soup: "corba",
    all: "hepsi",
  },
};