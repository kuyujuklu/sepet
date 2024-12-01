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
  home_page: {
    pubs_near_you: "Restaurante din apropiere",
    pub_is_closed: "Închis. Timp de lucru",
  },
  pub_info_page: {
    pub_header: {
      address: "Adresă",
      additional_info: "Informații suplimentare",
    },
  },
  basket_page: {
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
    back: "Înapoi",
  },
  create_order_page: {
    headline: "Creați comanda",
    additional_data: {
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
    headline: "Restaurante",
    pub_is_closed: "Închis. Timp de lucru",
  },
  categories: {
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
    all_publishments: "Toate unitățile",
  },
  order_info_page: {
    order: "Comanda",
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
  }
};
