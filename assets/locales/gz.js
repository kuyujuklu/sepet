export default {
  errors: {
    something_went_wrong: "Naşey sa gitti diil dooru?",
    unknown_error: "Dııl belli  yannışık",
    sms_service_unavailable:
      "Kod ile SMS gitmedi. Sora deneyin ya da destaya yazın",
    order_below_minimum: "Sımarlamanın sayısı bu erin en küçüündän aşaa",
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
      "Kullanmak icin bu programmı siz  kabul edersiniz",
    privacy_policy_link: "politika konfidencialnosti",
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
    title: "Teslimat adresi",
    subtitle: "Saklanan adresi seçin osa eni ekleyin — kuryer oraya gelecek",
    current_section: "Şindiki er",
    use_current: "Kullanın hem ileri",
    no_saved_title: "Saklanan adres şindilik yok",
    no_saved_text: "Adres ekleyin — gelän sıra onu bir dokunuşlan seçeceniz",
    add_address_inputs_hint: "Bu erin adı nedir? Sokak hem ev nomeri kuryerä lääzım",
    point_on_map: "Haritada nokta seçildi",
    change_point: "Diiştirin",
    detecting_address: "Adresi belli ediyoruz…",
    save_address: "Adresi sakla",
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
  sections: {
    headline: "Ne sipariş ederiz?",
    subheadline:
      "Bölümü seçin — teslimat adresini sonra, sipariş verirkän gösterirsiniz",
    coming_soon: "Tezdä",
    coming_soon_alert: "Bu bölüm tezdä açılacek",
    food: {
      title: "Imäk",
      subtitle: "Yakındakı restoranlardan hem kafelerdän imäklär",
      feed_subtitle:
        "Yakındakı restoranlardan faydalı imäklär — birkaç dokunuşlan sipariş",
      all_pubs_label: "Hepsi restorannar",
    },
    flowers: {
      title: "Çiçeklär",
      subtitle: "Buketlär hem kompozițiyalar teslimatlan",
      feed_subtitle: "Yakındakı çiçek dükkanlarından buketlär — bugün getireriz",
      all_pubs_label: "Hepsi çiçek dükkanları",
    },
    groceries: {
      title: "Produktlar",
      subtitle: "Produkt dükkanları hem ev için hepsi",
      feed_subtitle: "Yakındakı dükkanlardan produktlar",
      all_pubs_label: "Hepsi produkt dükkanları",
    },
  },
  city_picker: {
    headline: "Angı kasabadasınız?",
    subheadline:
      "Sade yakındakı erleri göstermää lääzım. Tam adresi sipariş verirkän gösterirsiniz",
    open_settings: "Ayarlarda geolokațiyaya izin verin",
    detecting: "Erinizi bulêrız…",
    select_manually: "Kasabayı kendiniz seçin",
  },
  header: {
    near_you: "Sizin yanınızda",
    approximate_hint: "Geolokațiyaya görä bulundu · tam etmää için basın",
    set_address: "Gösterin teslimat adresini",
    specify_address: "adresi gösterin",
  },
  profile: {
    title: "Profil",
    orders: "Benim siparişlerim",
    change_address: "Diiştirin adresi",
    language: "İnterfeys dili",
    additional_settings: "Ek ayarlar",
    notifications: "Bildirimnär",
    support: "Yardım",
    privacy: "Gizlilik",
    analytics_consent: "Analitika",
    analytics_consent_hint: "Programayı islää etmää yardım eder",
    privacy_policy: "Gizlilik politikası",
  },
  notifications_page: {
    title: "Bildirimnär",
    empty: "Şindilik yok bildirim",
    clear: "Temizlemää istoriyayı",
  },
  home_page: {
    select_another_geolocation: "Ayırın eni lokaţıyayı",
    no_available_pubs_for_location: "Biz etişämeeriz sizä",
    pubs_near_you: "Restorannar sizin yanınızda",
    pub_is_closed: "Kapalı. İş zamanı.",
    active_orders: "Aktiv siparişlär",
    top_dishes: {
      title: "İi satılan imäklär",
      subtitle: "Sizin yanınızdakı restorannardan faydalı imäklär",
      deals_title: "Yanan teklifler",
      deals_subtitle: "Sizin için topladık en faydalı pozițiyaları",
      filter_top: "Popular",
      filter_deals: "İndirim",
      filter_pubs: "Erlär",
      filters_button: "Filtrelemää",
      filters_sheet_subtitle: "Kategoriya ya da teslimat şartları",
      filters_delivery_group: "Teslimat",
      filter_free_delivery: "Bedava teslimat",
      sort_button: "Sıralamaa",
      sort_sheet_title: "Sıralamaa",
      sort_rating: "Reyting üzere",
      sort_distance: "Uzaklık üzere",
      sort_speed: "Teslimat hızı üzere",
      search_placeholder: "İmäk aarayın",
      search_cancel: "Vazgeç",
      search_prompt: "İmäk adını yazmaa başlayın",
      search_no_results: "Bişey bulunmadı",
      search_accessibility_label: "Aaramak",
      hit_badge: "Top",
      closed: "Kapalı",
      sold_out: "Yok",
      no_dishes: "Şindilik yok imäklär sipariş için",
      no_deals: "Şindi yok imäklär indirimnän",
      go_to_basket: "Sepedä",
      no_dishes_in_category: "Bu kategoriyada yakında şindilik yok imäklär",
      show_all_dishes: "Göstermää hepsi imäkleri",
    },
  },
  pub_info_page: {
    is_open: "Açık",
    phone: "Telefon",
    close: "Kapat",
    empty_menu: "Bu menüdä şindilik imäk yok",
    dishes_count: "İmäklär: {{value}}",
    pub_header: {
      address: "Adres",
      additional_info: "Bilgi",
    },
  },
  view_modes: {
    as_list: "Spisokllan",
    by_categories: "Kategoriyalara görä",
  },
  basket_page: {
    unavailable_dishes:
      "Kimi pozițiyalar şindi yok — sımarlamaa deyni onnarı çıkarın",
    min_order_left:
      "En küçük sımarlamak {{min}}. Taa {{amount}} koyun",
    subtotal: "Ara toplam",
    delivery: "Teslimat",
    delivery_free: "Parasız",
    total: "Hepsi",
    free_delivery_left: "Parasız teslimata {{amount}} kaldı",
    positions: "Poziţiya: {{value}}",
    minutes: "min",
    open_pub: "Menüyä",
    add_more: "Dahaa ekle",
    per_item: "bir dänä için",
    clear: "Temizle",
    clear_confirm: "Sepeti temizleyelim mi?",
    clear_ok: "Temizle",
    not_available_for_delivery:
      "Bu er şindi sizin adresä getirmeer",
    empty_title: "Sepet boş",
    empty_text: "İmäk ekleyin — burada görünecek",
    empty_button: "İmäk seçin",
    remove_dish: {
      title: "Poziţiyayı sepettän silelim mi?",
      cancel: "Kalsın",
      confirm: "Sil",
    },
    headline: "Sepet",
    empty: "Boş",
    create_order_button: "Ileri",
    pub_is_closed_error:
      "Restoran kapalı, savaşın soran, yada yapın sımarlamak başka restoranda",
    go_to_registration: "Ilerlemek için - registratiya yapın",
    },
  basket_popup: {
    another_pub_warning:
      "Siz savaşěrsınız yapmaa sımarlamak başka erdän. Tamannamaa? Sepet boşalacek!!!",
    cancel_button: "Bırak",
    ok_button: "Ok",
  },
  dish_popup: {
    sold_out: "Bu pozițiya şindi yok",
    in_basket: "Sepettä: {{value}}",
    back: "Hazır",
  },
  create_order_page: {
    address: {
      current: "Siparişi buraya getireceyiz",
      unknown: "Adres bulunmadı",
      change: "Adresi diiştir",
      saved_title: "Saklanan adreslär",
      no_saved: "Saklanan adres şindilik yok — ilkini haritada ekleyin",
      add_new: "Eni adres ekle",
      title: "Nereyi getirmää",
      hint: "Adres sade şindi lääzım — kuryer oraya gelecek",
      save_toggle: "Adresi saklamaa gelecek siparişlär için",
    },
    contacts: {
      title: "Kontaktlar",
    },
    comment: {
      title: "Siparişä komentariy",
    },
    order: {
      title: "Sizin sipariş",
    },
    headline: "Eni sımarlamak",
    additional_data: {
      fill_inputs: "Lääzımnı erleri doldurun",
      empty_basket: "Sepettä ürün yok",
      no_location: "Nereyi getirmää bilmeeriz — adresi gösterin",
      approximate_location:
        "Erleri yaklaşık erä görä gösterdik. Aşaada teslimat adresini kontrol edin.",
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
    no_orders_text:
      "Burada sizin sımarlamalarınız görünecek — herbirini bir kerä tekrarlamaa olêr",
    no_orders_button: "İmäklerä geç",
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
    nothing_found: "Burada şindilik bişey yok — başka kategoriya deneyin",
  },
  internet: {
    no_internet_title: "İnternet baalantısı yok",
    no_internet_text: "Baalantıyı kontrol edin hem bir taa deneyin",
  },
  categories: {
    all: "Hepsi",
    all_publishments: "Hepsi restorannar",
    show_all: "Taa",
    sheet_title: "Kategoriyalar",
  },
  order_info_page: {
    order: "Sımarlamak",
    all_changes_from_tech: "Hepsi disiklikler yapiler",
    support: "operatordan",
    dishes_title: "Sımarlamanın içindekilär",
    no_dishes: "Sımarlamanın içindekilerini üklemäk olmadı",
  },
  delete_account_popup: {
    headline: "Benim akauntımı sil",
    main_text:
      "Sepet accaautsı silinirse, tüm verileriniz silinecektir, bilgileriniz, siparişleriniz, adınız, e-posta adresiniz, telefon numaranız, teslimat adresleriniz, seçilen konumlarınız, restoran değerlendirmeleriniz, sipariş oluşturma geçmişiniz, cihazınıza ilişkin bilgiler ve çerezler gibi tüm veriler silinecektir.",
    subscription: "Bu işlem geri alınamaz.",
    back: "Geeri",
    delete: "Sil",
  },
  pub_card: {
    free_delivery_from: "Parasiz götürmäk",
  },
  pub_not_available_for_delivery: {
    title: "Sipariş verilämeer",
    pub_is_not_open: "Siz bu restorandan uzaktaysınız",
    choose_another_pub: "Başka restoranı ayırın",
    change_geolocation: "Diiştirin lokaţiyayı",
    closed_toast: "Restoran häzir kapalı, ama siz sepetinizi toplayabilirsiniz ya da işçi vakıtında sipariş verebilirsiniz"
  }
};
