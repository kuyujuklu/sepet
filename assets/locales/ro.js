export default {
  errors: {
    something_went_wrong: "Ceva nu a mers bine",
    unknown_error: "Eroare necunoscută",
    unauthorized: "Neautorizat",
    client_with_the_same_phone_already_exists:
      "Clientul cu același număr de telefon există deja",

    validation_error: "Eroare de validare",
    invalid_email: "Email invalid",
    min: "Minim",
    max: "Maxim",
    field_must_be_number: "Câmpul trebuie să fie un număr",
    invalid_url_name: "Nume URL invalid",
    file_is_too_large: "Fișierul este prea mare",
    invalid_file_extension: "Extensie de fișier invalidă",
    file_is_not_an_image: "Fișierul nu este o imagine",
    invalid_file: "Fișier invalid",
    passwords_are_not_equal: "Parolele nu coincid",
    invalid_phone: "Număr de telefon invalid",
    invalid_password: "Parolă invalidă",
    client_not_found: "Clientul nu a fost găsit",
    field_is_required: "Câmpul este obligatoriu",
    this_pub_is_not_delivering_in_your_area:
      "Acest restaurant nu livrează momentan la adresa dvs.",
    in_this_time_delivery_not_working:
      "Livrarea nu este disponibilă în acest moment.",
    too_many_sessions: "Trimiteți cereri de înregistrare prea des",
    invalid_session_validation_number: "Cod de verificare nevalid",
    validation: {
      client: {
        name_is_required: "Numele este obligatoriu",
        min_name_length_is_3: "Numele trebuie să conțină minim 3 caractere",
        max_name_length_is_100:
          "Numele trebuie să conțină maxim 100 de caractere",

        password_is_required: "Parola nu poate fi goală",
        min_password_length_is_6: "Minim 6 caractere",
        min_password_length_is_100: "Maxim 100 de caractere",
      },
      order: {
        town_min_length_is_3:
          "Numele orașului trebuie să conțină minim 3 caractere",
        town_max_length_is_100:
          "Numele orașului trebuie să conțină maxim 100 de caractere",
        full_address_min_length_is_10:
          "Adresa completă trebuie să conțină cel puțin 10 caractere",
        full_address_max_length_is_100:
          "Adresa completă trebuie să conțină maxim 100 de caractere",
      },
    },
  },
  auth: {
    logout: "Deconectare",
    guest_account: "Cont de oaspete",
    login_as_guest: "Conectați fără înreg.",
    headline: "Autentificare",
    pass_validation_code_from_sms: "Introduceți codul din SMS",
    go_back: "Înapoi",
    send_again: "Trimite din nou",
    submit: "Confirmare",
    go_to_registration: "Nu aveți un cont? Înregistrare",
    go_to_delete_account: "Doriți să vă ștergeți contul? Click aici",
    privacy_policy_text:
      "Continuând să utilizați această aplicație, sunteți de acord cu",
    privacy_policy_link: "politica de confidențialitate",
    inputs: {
      phone_number: { label: "Număr de telefon" },
      password: { label: "Parolă" },
    },
  },
  registration: {
    headline: "Înregistrare",
    pass_validation_code_from_sms: "Introduceți codul din SMS",
    go_back: "Înapoi",
    send_again: "Trimite din nou",
    submit: "Confirmare",
    go_to_auth: "Aveți deja un cont? Autentificare",
    inputs: {
      name: { label: "Nume Prenume" },
      phone_number: { label: "Număr de telefon" },
      password: { label: "Parolă" },
      repeat_password: { label: "Repetă parola", errors: {} },
    },
  },
  select_geolocation: {
    title: "Adresa de livrare",
    subtitle: "Alegeți o adresă salvată sau adăugați una nouă — curierul va veni la ea",
    current_section: "Locația curentă",
    use_current: "Folosiți și continuați",
    no_saved_title: "Încă nu aveți adrese salvate",
    no_saved_text: "Adăugați o adresă — data viitoare o alegeți dintr-o singură atingere",
    add_address_inputs_hint: "Cum se numește acest loc? Strada și numărul îi trebuie curierului",
    point_on_map: "Punctul pe hartă este ales",
    change_point: "Schimbați",
    save_address: "Salvați adresa",
    saved_addresses: "Adrese salvate",
    headline: "Selectați locația dvs.",

    continue: "Continua",
    back: "înapoi",
    add_new_address: "Adăugați adresa de livrare",
    add_address_inputs_headline: "Introduceți adresa dvs",

    select_by_yourself_button: "Selectați manual",
    wait_geolocation_is_loading: "Așteptați, încărcăm locația dvs.",
    pin_geolocation: "Adăuga o nouă adresă",
    we_cannot_load_your_geolocaiton:
      "Nu am putut încărca locația, vă rugăm să o selectați manual",
    change_geolocation: "Schimba locatia",
  },
  sections: {
    headline: "Ce comandăm?",
    subheadline:
      "Alegeți secțiunea — adresa de livrare o indicați mai târziu, la plasarea comenzii",
    coming_soon: "În curând",
    coming_soon_alert: "Această secțiune se deschide în curând",
    food: {
      title: "Mâncare",
      subtitle: "Preparate din restaurantele și cafenelele de lângă dvs.",
      feed_subtitle:
        "Preparate avantajoase din restaurantele din apropiere — comandă din câteva atingeri",
    },
    flowers: {
      title: "Flori",
      subtitle: "Buchete și aranjamente cu livrare",
      feed_subtitle: "Buchete din florăriile din apropiere — livrăm astăzi",
    },
    groceries: {
      title: "Produse",
      subtitle: "Magazine alimentare și tot pentru casă",
      feed_subtitle: "Produse din magazinele din apropiere",
    },
  },
  cities: {
    chisinau: "Chișinău",
    balti: "Bălți",
    comrat: "Comrat",
    cahul: "Cahul",
    orhei: "Orhei",
    ungheni: "Ungheni",
    ceadir_lunga: "Ceadîr-Lunga",
    tiraspol: "Tiraspol",
  },
  city_picker: {
    headline: "În ce oraș vă aflați?",
    subheadline:
      "Ne trebuie doar ca să arătăm localurile din apropiere. Adresa exactă o indicați la plasarea comenzii",
    open_settings: "Permiteți accesul la locație în setări",
    detecting: "Determinăm locația dvs…",
    select_manually: "Alegeți orașul manual",
  },
  header: {
    near_you: "Lângă dvs.",
    approximate_hint: "Determinat prin geolocație · atingeți pentru a preciza",
    set_address: "Indicați adresa de livrare",
    specify_address: "precizați adresa",
  },
  profile: {
    title: "Profil",
    orders: "Comenzile mele",
    change_address: "Schimbați adresa",
    language: "Limba interfeței",
    support: "Suport",
  },
  home_page: {
    pubs_near_you: "Restaurante din apropiere",
    pub_is_closed: "Închis. Timp de lucru",
    top_dishes: {
      title: "Cele mai vândute",
      subtitle: "Preparate avantajoase din restaurantele din apropiere",
      filter_top: "Populare",
      filter_deals: "Cu reducere",
      filter_near: "În apropiere",
      filter_pubs: "Localuri",
      hit_badge: "Top",
      closed: "Închis",
      no_dishes: "Deocamdată nu sunt preparate disponibile",
      no_deals: "Acum nu sunt preparate cu reducere",
      go_to_basket: "Spre coș",
      no_dishes_in_category: "În această categorie încă nu sunt preparate în apropiere",
      show_all_dishes: "Arată toate preparatele",
      filters_button: "Filtre",
      filters_title: "Filtre",
      filters_dishes_group: "Arată preparate",
      filters_pubs_group: "Sau vezi localurile",
    },
  },
  pub_info_page: {
    is_open: "Deschis",
    phone: "Telefon",
    close: "Închide",
    empty_menu: "În acest meniu încă nu sunt preparate",
    dishes_count: "Preparate: {{value}}",
    pub_header: {
      address: "Adresă",
      additional_info: "Informații suplimentare",
    },
  },
  view_modes: {
    as_list: "Ca listă",
    by_categories: "Pe categorii",
  },
  basket_page: {
    subtotal: "Subtotal",
    delivery: "Livrare",
    delivery_free: "Gratuit",
    total: "Total",
    free_delivery_left: "Până la livrarea gratuită mai trebuie {{amount}}",
    positions: "Poziții: {{value}}",
    minutes: "min",
    open_pub: "La meniu",
    add_more: "Mai adaugă",
    per_item: "pe bucată",
    clear: "Golește",
    clear_confirm: "Goliți coșul?",
    clear_ok: "Golește",
    not_available_for_delivery:
      "Acest local nu livrează acum la adresa dvs.",
    empty_title: "Coșul este gol",
    empty_text: "Adăugați preparate — vor apărea aici",
    empty_button: "Alegeți preparate",
    remove_dish: {
      title: "Ștergeți poziția din coș?",
      cancel: "Păstrează",
      confirm: "Șterge",
    },
    headline: "Coșul",
    empty: "gol",
    create_order_button: "Creați comanda",
    pub_is_closed_error:
      "Acest restaurant este în prezent închis, vă rugăm să încercați mai târziu sau să comandați de la altul.",
    go_to_registration: "Pentru a continua - înregistrează-te"

  },
  basket_popup: {
    another_pub_warning:
      "Încercați să adăugați un articol dintr-un alt restaurant. Căruciorul va fi gol.",
    cancel_button: "Înapoi",
    ok_button: "ok",
  },
  dish_popup: {
    in_basket: "În coș: {{value}}",
    back: "Înapoi",
  },
  create_order_page: {
    address: {
      current: "Livrăm comanda aici",
      unknown: "Adresa nu este determinată",
      change: "Schimbați adresa",
      saved_title: "Adrese salvate",
      no_saved: "Încă nu aveți adrese salvate — adăugați prima pe hartă",
      add_new: "Adăugați o adresă nouă",
      title: "Unde livrăm",
      hint: "Adresa este necesară abia acum — curierul va veni la ea",
    },
    contacts: {
      title: "Contacte",
    },
    comment: {
      title: "Comentariu la comandă",
    },
    order: {
      title: "Comanda dvs.",
    },
    headline: "Creați comanda",
    additional_data: {
      fill_inputs: "Completați câmpurile obligatorii",
      empty_basket: "Coșul este gol",
      no_location: "Nu știm unde să livrăm — indicați adresa",
      approximate_location:
        "Am afișat localurile după o locație aproximativă. Verificați adresa de livrare de mai jos.",
      headline: "Detalii despre comandă",
      inputs: {
        town: { label: "Oraș/Raion" },
        full_address: { label: "Adresă completă" },
        main_phone_number: { label: "Număr de telefon principal" },
        second_phone_number: { label: "Număr de telefon secundar" },
        comments: { label: "Comentarii la comandă" },
        payment_type: {
          label: "Tipul de plată",
          values: { cash: "Numerar", card_offline: "Transfer la curier" },
        },
      },
      delivery_time: "Timpul de livrare",
      items_price: "Prețul produselor",
      delivery_price: "Prețul livrării",
      total_sum: "Total",
      create_order_button: "Inainte",
    },
  },
  order_page: {
    headline: "Ultimele comenzi",
    headline_no_orders: "Nu ați făcut încă nicio comandă",
    no_orders_text:
      "Aici vor apărea comenzile dvs. — oricare dintre ele poate fi repetată dintr-o atingere",
    no_orders_button: "Spre preparate",
    order_card: {
      unable_to_repeat_order: "Din păcate, nu putem repeta această comanda.",
      order_is_not_completed_alert: "Comanda nu a fost încă livrată",
      positions: "Poziții",
      rate_button: "Evaluați",
      repeat_button: "Repetă",
      order: "Comanda",
      order_statuses: {
        not_handled: "În așteptare",
        handled: "Considerat",
        preparing: "Se pregătește",
        at_courier: "La curier",
        completed: "Livrat",
        canceled: "Anulat",
      },
    },
  },
  near_categories_page: {
    nothing_found: "Aici încă nu este nimic — încercați altă categorie",
  },
  internet: {
    no_internet_title: "Nu există conexiune la internet",
    no_internet_text: "Verificați conexiunea și încercați din nou",
  },
  categories: {
    sales: "promoții",
    asian: "asiatice",
    flowers: "flori",
    fast_food: "fast-food",
    breakfast: "mic dejun",
    grill: "grătar",
    dessert: "deserturi",
    pasta: "paste",
    pancakes: "clătite",
    soup: "supe",
    alcohol: "alcool",
    east_food: "bucătăria orientală",
    flour: "mâncăruri de făină",
    home_food: "mânc facuta acasa",
    kebab: "kebab",
    salad: "salate",
    snacks: "gustări",
    meat: "mâncăruri din carne",
    all: "Toate",
    all_publishments: "Toate unitățile",
    show_all: "Mai multe",
    sheet_title: "Categorii",
    sheet_subtitle: "Alegeți o categorie pentru a filtra preparatele",
  },
  order_info_page: {
    order: "Comanda",
    all_changes_from_tech: "Toate modificările comenzii se fac numai prin",
    support: "asistență tehnică",
    dishes_title: "Conținutul comenzii",
    no_dishes: "Nu am reușit să încărcăm conținutul comenzii",
  },
  delete_account_popup: {
    headline: "Ștergeți contul meu",
    main_text:
      "Atenţie! Ștergerea unui cont Sepet înseamnă ștergerea tuturor datelor despre dvs., cum ar fi: comenzile dvs., numele dvs., e-mailul, telefonul, adresele de livrare, locațiile selectate, evaluările restaurantelor, istoricul comenzilor, informații despre dispozitivul dvs. și cookie-uri.",
    subscription: "Această acțiune este ireversibilă.",
    back: "Spate",
    delete: "Şterge contul",
  },
  pub_card: {
    free_delivery_from: "Livrare gratuita de la"
  },
  pub_not_available_for_delivery: {
    title: "Comanda nu poate fi plasată",
    pub_is_not_open: "Acest local este închis în prezent sau vă aflați în afara zonei de livrare a acestui local.",
    choose_another_pub: "Selectați o altă instituție",
    change_geolocation: "Schimbați locația"
  }
};
