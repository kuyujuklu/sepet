import { translateLocation } from "../utils/location";

export const currencies = [
  {
    id: 1,
    name: "MDL",
    symbol: "Lei",
  },
  {
    id: 4,
    name: "USD",
    symbol: "$",
  },
  {
    id: 2,
    name: "EUR",
    symbol: "€",
  },
  {
    id: 3,
    name: "GBP",
    symbol: "£",
  },
  {
    id: 5,
    name: "TRY",
    symbol: "₺",
  },
];

export const categoryTypes = {
  Asian: {
    value: "asian",
    text: "admin.categories.category_types.asian",
  },
  FastFood: {
    value: "fast_food",
    text: "admin.categories.category_types.fast_food",
  },
  Breakfast: {
    value: "breakfast",
    text: "admin.categories.category_types.breakfast",
  },
  Grill: {
    value: "grill",
    text: "admin.categories.category_types.grill",
  },
  Dessert: {
    value: "dessert",
    text: "admin.categories.category_types.dessert",
  },
  Pasta: {
    value: "pasta",
    text: "admin.categories.category_types.pasta",
  },
  Pancakes: {
    value: "pancakes",
    text: "admin.categories.category_types.pancakes",
  },
  Soup: {
    value: "soup",
    text: "admin.categories.category_types.soup",
  },
  Other: {
    value: "other",
    text: "admin.categories.category_types.other"
  }
};

export const orderPaymentTypes = {
  cardOffline: "card_offline",
  cash: "cash",
};

export const orderTypes = {
  delivery: "delivery",
  inPlace: "in_place",
};

export const orderStatuses = {
  notHandled: "not_handled",
  handled: "handled",
  preparing: "preparing",
  completed: "completed",
  canceled: "canceled"
};

export const tariffs = {
  basic: "basic",
  pro: "pro",
  business: "business",
};

export const deliveryTypes = {
  own: "own",
  deliveryService: "delivery_service"
}

export const locations = {
  Alekseevka: "Alekseevka",
  Avdarma: "Avdarma",
  Baurchi: "Baurchi",
  Beshgioz: "Beshgioz",
  Beshalma: "Beshalma",
  Bujak: "Bujak",
  Cioc_Maidan: "Cioc_Maidan",
  Cismikoi: "Cismikoi",
  Dezginja: "Dezginja",
  Djoltai: "Djoltai",
  Dudulesht: "Dudulesht",
  Eutulia: "Eutulia",
  Eutulia_Noua: "Eutulia_Noua",
  Ferapontyevka: "Ferapontyevka",
  Gaydar: "Gaydar",
  Komrat: "Komrat",
  Karbalia: "Karbalia",
  Kazaklia: "Kazaklia",
  Kirsova: "Kirsova",
  Kiriyet_Lunga: "Kiriyet_Lunga",
  Kongaz: "Kongaz",
  Kongazchik_de_Jos: "Kongazchik_de_Jos",
  Kongazchik_de_Sus: "Kongazchik_de_Sus",
  Kopchak: "Kopchak",
  Kotovskoe: "Kotovskoe",
  Russkaya_Kiseliya: "Russkaya_Kiseliya",
  Svetliy: "Svetliy",
  Tomai: "Tomai",
  Taraclia: "Taraclia",
  Vulkanesht: "Vulkanesht",
}

export const ru_translates = {
  [locations.Komrat]: "Комрат",
  [locations.Alekseevka]: "Алексеевка",
  [locations.Avdarma]: "Авдарма",
  [locations.Baurchi]: "Баурчи",
  [locations.Beshgioz]: "Бешгёз",
  [locations.Beshalma]: "Бешалма",
  [locations.Bujak]: "Буджак",
  [locations.Cioc_Maidan]: "Чок-Майдан",
  [locations.Cismikoi]: "Чишмикёй",
  [locations.Dezginja]: "Дезгинжа",
  [locations.Djoltai]: "Жолтай",
  [locations.Dudulesht]: "Дудулешть",
  [locations.Eutulia]: "Етулия",
  [locations.Eutulia_Noua]: "Етулия Ноуэ",
  [locations.Ferapontyevka]: "Ферапонтьевка",
  [locations.Gaydar]: "Гайдар",
  [locations.Karbalia]: "Карбалия",
  [locations.Kazaklia]: "Казаклия",
  [locations.Kirsova]: "Кирсова",
  [locations.Kiriyet_Lunga]: "Кириет-Лунга",
  [locations.Kongaz]: "Конгаз",
  [locations.Kongazchik_de_Jos]: "Конгазчикул де Жос",
  [locations.Kongazchik_de_Sus]: "Верхний Конгазчик",
  [locations.Kopchak]: "Копчак",
  [locations.Kotovskoe]: "Котовское",
  [locations.Russkaya_Kiseliya]: "Русская Киселия",
  [locations.Svetliy]: "Светлый",
  [locations.Tomai]: "Томай",
  [locations.Taraclia]: "Тараклия",
  [locations.Vulkanesht]: "Вулканешты"
}

export const ro_translates = {
  [locations.Komrat]: "Comrat",
  [locations.Alekseevka]: "Alexeevca",
  [locations.Avdarma]: "Avdarma",
  [locations.Baurchi]: "Baurci",
  [locations.Beshgioz]: "Beșghioz",
  [locations.Beshalma]: "Beșalma",
  [locations.Bujak]: "Bugeac",
  [locations.Cioc_Maidan]: "Cioc-Maidan",
  [locations.Cismikoi]: "Cișmichioi",
  [locations.Dezginja]: "Dezghingea",
  [locations.Djoltai]: "Joltai",
  [locations.Dudulesht]: "Dudulești",
  [locations.Eutulia]: "Etulia",
  [locations.Eutulia_Noua]: "Etulia Nouă",
  [locations.Ferapontyevka]: "Ferapontievca",
  [locations.Gaydar]: "Gaidar",
  [locations.Karbalia]: "Carbalia",
  [locations.Kazaklia]: "Cazaclia",
  [locations.Kirsova]: "Chirsova",
  [locations.Kiriyet_Lunga]: "Chiriet-Lunga",
  [locations.Kongaz]: "Congaz",
  [locations.Kongazchik_de_Jos]: "Congazcicul de Jos",
  [locations.Kongazchik_de_Sus]: "Congazcicul de Sus",
  [locations.Kopchak]: "Copceac",
  [locations.Kotovskoe]: "Cotovscoe",
  [locations.Russkaya_Kiseliya]: "Chioselia Rusă",
  [locations.Svetliy]: "Svetlîi",
  [locations.Tomai]: "Tomai",
  [locations.Taraclia]: "Taraclia",
  [locations.Vulkanesht]: "Vulcănești"
}




export const latlng_for_location = {
  [locations.Komrat]: { lat: 46.29702416981608, lng: 28.657744568868456 },
  [locations.Alekseevka]: { lat: 46.028814992444154, lng: 28.56631606808621 },
  [locations.Avdarma]: { lat: 46.25376233043438, lng: 28.835899136330227 },
  [locations.Baurchi]: { lat: 46.10518617036749, lng: 28.68508750364356 },
  [locations.Beshgioz]: { lat: 46.12202620732668, lng: 28.87573677041682 },
  [locations.Beshalma]: { lat: 46.16762997472133, lng: 28.647864322882842 },
  [locations.Bujak]: { lat: 46.36268324036275, lng: 28.673768143967074 },
  [locations.Cioc_Maidan]: { lat: 46.36540480154892, lng: 28.820781029282195 },
  [locations.Cismikoi]: { lat: 45.552039230563075, lng: 28.382073442846178 },
  [locations.Dezginja]: { lat: 46.427485561903836, lng: 28.61627291812195 },
  [locations.Djoltai]: { lat: 46.179252789627014, lng: 28.870761401594173 },
  [locations.Dudulesht]: { lat: 46.32764857753622, lng: 28.515970396579412 },
  [locations.Eutulia]: { lat: 45.54127999490064, lng: 28.442509048661055 },
  [locations.Eutulia_Noua]: { lat: 45.516893341622435, lng: 28.43832669300815 },
  [locations.Ferapontyevka]: { lat: 46.23435721613818, lng: 28.775210433383183 },
  [locations.Gaydar]: { lat: 46.116850626741225, lng: 28.76672598272208 },
  [locations.Karbalia]: { lat: 45.87607062207062, lng: 28.44488997431404 },
  [locations.Kazaklia]: { lat: 46.01102649210984, lng: 28.661118932622458 },
  [locations.Kirsova]: { lat: 46.232632725659805, lng: 28.64762289926025 },
  [locations.Kiriyet_Lunga]: { lat: 46.21192616247219, lng: 28.946715604909798 },
  [locations.Kongaz]: { lat: 46.10766373502306, lng: 28.59185982345459 },
  [locations.Kongazchik_de_Jos]: { lat: 46.315945860237846, lng: 28.56877681119248 },
  [locations.Kongazchik_de_Sus]: { lat: 46.33255716815939, lng: 28.56620196191921 },
  [locations.Kopchak]: { lat: 45.84740083675676, lng: 28.693777830119377 },
  [locations.Kotovskoe]: { lat: 46.163714190100535, lng: 28.51543300584663 },
  [locations.Russkaya_Kiseliya]: { lat: 46.08357125041431, lng: 28.51363196013111 },
  [locations.Svetliy]: { lat: 46.01923725917045, lng: 28.568400542201818 },
  [locations.Tomai]: { lat: 46.18585059137405, lng: 28.767184597106237 },
  [locations.Taraclia]: { lat: 45.90599616464692, lng: 28.668693757759318 },
  [locations.Vulkanesht]: { lat: 45.683780741222435, lng: 28.402447692838397 },
};

export const select_location_options_ru = [
  { value: locations.Komrat, label: ru_translates[locations.Komrat] },
  { value: locations.Alekseevka, label: ru_translates[locations.Alekseevka] },
  { value: locations.Avdarma, label: ru_translates[locations.Avdarma] },
  { value: locations.Baurchi, label: ru_translates[locations.Baurchi] },
  { value: locations.Beshgioz, label: ru_translates[locations.Beshgioz] },
  { value: locations.Beshalma, label: ru_translates[locations.Beshalma] },
  { value: locations.Bujak, label: ru_translates[locations.Bujak] },
  { value: locations.Cioc_Maidan, label: ru_translates[locations.Cioc_Maidan] },
  { value: locations.Cismikoi, label: ru_translates[locations.Cismikoi] },
  { value: locations.Dezginja, label: ru_translates[locations.Dezginja] },
  { value: locations.Djoltai, label: ru_translates[locations.Djoltai] },
  { value: locations.Dudulesht, label: ru_translates[locations.Dudulesht] },
  { value: locations.Eutulia, label: ru_translates[locations.Eutulia] },
  { value: locations.Eutulia_Noua, label: ru_translates[locations.Eutulia_Noua] },
  { value: locations.Ferapontyevka, label: ru_translates[locations.Ferapontyevka] },
  { value: locations.Gaydar, label: ru_translates[locations.Gaydar] },
  { value: locations.Karbalia, label: ru_translates[locations.Karbalia] },
  { value: locations.Kazaklia, label: ru_translates[locations.Kazaklia] },
  { value: locations.Kirsova, label: ru_translates[locations.Kirsova] },
  { value: locations.Kiriyet_Lunga, label: ru_translates[locations.Kiriyet_Lunga] },
  { value: locations.Kongaz, label: ru_translates[locations.Kongaz] },
  { value: locations.Kongazchik_de_Jos, label: ru_translates[locations.Kongazchik_de_Jos] },
  { value: locations.Kongazchik_de_Sus, label: ru_translates[locations.Kongazchik_de_Sus] },
  { value: locations.Kopchak, label: ru_translates[locations.Kopchak] },
  { value: locations.Kotovskoe, label: ru_translates[locations.Kotovskoe] },
  { value: locations.Russkaya_Kiseliya, label: ru_translates[locations.Russkaya_Kiseliya], },
  { value: locations.Svetliy, label: ru_translates[locations.Svetliy], },
  { value: locations.Tomai, label: ru_translates[locations.Tomai], },
  { value: locations.Taraclia, label: ru_translates[locations.Taraclia] },
  { value: locations.Alekseevka, label: ru_translates[locations.Alekseevka] },
  { value: locations.Vulkanesht, label: ru_translates[locations.Vulkanesht] },
]

export const select_location_options_ro = [
  { value: locations.Komrat, label: ro_translates[locations.Komrat] },
  { value: locations.Alekseevka, label: ro_translates[locations.Alekseevka] },
  { value: locations.Avdarma, label: ro_translates[locations.Avdarma] },
  { value: locations.Baurchi, label: ro_translates[locations.Baurchi] },
  { value: locations.Beshgioz, label: ro_translates[locations.Beshgioz] },
  { value: locations.Beshalma, label: ro_translates[locations.Beshalma] },
  { value: locations.Bujak, label: ro_translates[locations.Bujak] },
  { value: locations.Cioc_Maidan, label: ro_translates[locations.Cioc_Maidan] },
  { value: locations.Cismikoi, label: ro_translates[locations.Cismikoi] },
  { value: locations.Dezginja, label: ro_translates[locations.Dezginja] },
  { value: locations.Djoltai, label: ro_translates[locations.Djoltai] },
  { value: locations.Dudulesht, label: ro_translates[locations.Dudulesht] },
  { value: locations.Eutulia, label: ro_translates[locations.Eutulia] },
  { value: locations.Eutulia_Noua, label: ro_translates[locations.Eutulia_Noua] },
  { value: locations.Ferapontyevka, label: ro_translates[locations.Ferapontyevka] },
  { value: locations.Gaydar, label: ro_translates[locations.Gaydar] },
  { value: locations.Karbalia, label: ro_translates[locations.Karbalia] },
  { value: locations.Kazaklia, label: ro_translates[locations.Kazaklia] },
  { value: locations.Kirsova, label: ro_translates[locations.Kirsova] },
  { value: locations.Kiriyet_Lunga, label: ro_translates[locations.Kiriyet_Lunga] },
  { value: locations.Kongaz, label: ro_translates[locations.Kongaz] },
  { value: locations.Kongazchik_de_Jos, label: ro_translates[locations.Kongazchik_de_Jos] },
  { value: locations.Kongazchik_de_Sus, label: ro_translates[locations.Kongazchik_de_Sus] },
  { value: locations.Kopchak, label: ro_translates[locations.Kopchak] },
  { value: locations.Kotovskoe, label: ro_translates[locations.Kotovskoe] },
  { value: locations.Russkaya_Kiseliya, label: ro_translates[locations.Russkaya_Kiseliya], },
  { value: locations.Svetliy, label: ro_translates[locations.Svetliy], },
  { value: locations.Tomai, label: ro_translates[locations.Tomai], },
  { value: locations.Taraclia, label: ro_translates[locations.Taraclia] },
  { value: locations.Alekseevka, label: ro_translates[locations.Alekseevka] },
  { value: locations.Vulkanesht, label: ro_translates[locations.Vulkanesht] },
]

