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
      "Acest restaurant nu livrează în zona dvs.",
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
    headline: "Autentificare",
    pass_validation_code_from_sms: "Introduceți codul din SMS",
    go_back: "Înapoi",
    send_again: "Trimite din nou",
    submit: "Confirmare",
    go_to_registration: "Nu aveți un cont? Înregistrare",
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
      name: { label: "Nume" },
      phone_number: { label: "Număr de telefon" },
      password: { label: "Parolă" },
      repeat_password: { label: "Repetă parola", errors: {} },
    },
  },
  select_geolocation: {
    headline: "Selectați locația dvs.",
    wait_geolocation_is_loading: "Așteptați, încărcăm locația dvs.",
    pin_geolocation: "Marcați locația",
  },
  home_page: { pubs_near_you: "Restaurante aproape de dvs." },
  pub_info_page: {
    pub_header: {
      address: "Adresă",
      additional_info: "Informații suplimentare",
    },
  },
  basket_page: {
    headline: "Coșul de cumpărături",
    create_order_button: "Creați comanda",
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
          values: { cash: "Numerar", card_offline: "Card la curier" },
        },
      },
      delivery_time: "Timpul estimat de livrare",
      items_price: "Prețul produselor",
      delivery_price: "Prețul livrării",
      total_sum: "Total",
      create_order_button: "Creați comanda",
    },
  },
  order_page: {
    headline: "Ultimele dvs. comenzi",
    headline_no_orders: "Nu ați făcut încă nicio comandă",
    order_card: {
      positions: "Poziții",
      rate_button: "Evaluați",
      repeat_button: "Repetă",
      order_statuses: {
        not_handled: "În așteptare",
        handled: "Rezolvat",
        preparing: "Pregătit",
        completed: "Livrare finalizată",
      },
    },
  },
  near_categories_page: { headline: "Restaurante" },
};
