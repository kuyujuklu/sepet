import style from "../sass/index.module.scss";
const FirstInfoBlock = () => {
    return (
        <div className={`${style.wrap} text-center md:text-left`}>

            <wrapper className="conteiner">
            {/* <!-- Header and sandwich panel --> */}

                <div className="content m-auto">
                    {/* <!-- Main content  --> */}
                    <div className="main">
                    {/* <!-- first block --> */}
                    <section className="max-w-6xl m-auto my-20 md:my-20 p-2 ">
                        <div className="md:flex justify-evenly bg-white rounded-xl md:bg-transparent">
                            <div className="left  md:w-1/2 p-2 ">
                                <span className="prehead p-4">
                                    {/* Обработка заказов в админ панели */}
                                    Принимай онлайн заказы
                                    {/* <!-- Первый продукт в сфере услуг --> */}
                                </span>
                                <h1 className="heading p-4 md:text-7xl text-5xl">
                                    Terminal оптимизирует процессы 
                                </h1>
                                <p className="description p-4">
                                    С функцией оповещений и обновления списка заказов в "реал тайм", работники никогда не пропустят новый заказ.
                                </p>
                                <p className="description p-4">
                                    Все для упрощения процессов работы.
                                </p>
                                    <ul className="p-4 m-2">
                                        <li className="mb-6">Повара мгновенно оценивают доступность ингридиентов для приготовления заказа и сразу начинают ее готовить...</li>
                                        <li className="mb-6">Курьеры видят когда готовка подойдет к концу и нужно приехать за заказом...</li>
                                        <li className="mb-6">Администратор следит за качеством и скоростью приготовления и доставки заказов...</li>
                                    </ul>
                                    
                                <div className="actionBtn p-4 mt-2">
                                    {/* <button id="" className="mb-2 rounded-xl text-white bg-blue-500">
                                        <a className="p-3" href="https://qrmenu.sandex.md/">
                                            Попробовать QR Menu бесплатно
                                        </a>
                                    </button>
                                    <button id="openLeaveMessage2"
                                        className=" openLeaveMessage mr-4 p-3 rounded-xl border-2 border-gray-800">
                                        Задать вопрос
                                    </button> */}
                                </div>
                            </div>
                            <div className="right md:w-1/2 p-2">
                                <img alt="Обработка онлайн заказов в админ панели" className="m-auto border rounded-2xl shadow-2xl"
                                    src="/images/png/order_admin.png" />
                            </div>
                        </div>
                    </section>

                    {/* <!-- second block  --> */}
                    <section className="max-w-6xl m-auto my-20 md:my-20 p-2 ">
                        <div className="">
                            <div className="text-center text-2xl slogan">
                                Мы объединяем работников в админ панели
                            </div>
                            <div className="text-center logoWide p-2 m-auto">
                                <div className=" mind"></div>
                                {/* <!-- <img alt=""className="p-4 h-20" src="/" /> --> */}
                                Повара могут уделять больше времени деталям блюда. Курьеры тщательнее планировать доставку чтобы доставить все в срок и недорого.
                            </div>
                        </div>

                        
                    </section>

                    {/* <!-- third block  --> */}
                    <section className="max-w-6xl m-auto my-36 p-2 ">
                        <div className=" md:flex justify-evenly bg-white rounded-xl">
                            <div className="1/2part md:w-1/2 p-2">
                                <h1 className="heading p-4 md:text-6xl text-5xl">
                                    Умная доставка
                                </h1>
                                <div className="description p-4">Настрой радиус доставки куда доставляют ваши курьеры.
                                </div>
                                <p className="description p-4">
                                    Отмечай доступные методы оплаты и время доставки.

                                </p>
                                <p className="description p-4"></p>

                                <div className="actionBtn p-4 mt-2">
                                    {/* <button id="openLeaveMessage3"
                                        className=" openLeaveMessage mr-4 p-3 rounded-xl text-white bg-blue-500">
                                        Консультация
                                    </button> */}
                                </div>
                            </div>
                            <div className="1/2part md:w-1/2 p-2" >
                                <img alt="Настройка зоны и времени доставки ресторана" className="m-auto p-4 md:relative -z-1 -top-16 border rounded-2xl shadow-2xl"
                                    src="/images/png/shipping_admin.png"></img>
                                    {/* <Image
                                    className="rounded-2xl bg-red-600 w-100 h-100"
                                    style={{ objectFit: "cover" }}
                                    cover
                                    src="/images/png/shipping_admin.png"
                                    alt="image"
                                    /> */}
                            </div>
                        </div>
                    </section>

                    {/* <!-- four block  --> */}
                    <section className="max-w-6xl m-auto my-20 md:my-20 p-2 ">
                        <div className="md:flex justify-evenly bg-white rounded-xl md:bg-transparent">
                            <div className="right md:w-1/2 p-2 ">
                                <img alt="Заполнение и настройка электронного меню" className="m-auto border rounded-2xl shadow-2xl"
                                    src="/images/png/menu_admin.png" />
                            </div>
                            <div className="left md:w-1/2 p-2 ">
                                <span className="prehead p-4"></span>
                                <h1 className="heading p-4 text-5xl">
                                    Удобное меню
                                </h1>
                                <p className="description p-4">
                                    Удобное редактирование позиций и обновление фотографий блюд когда угодно

                                </p>
                                <p className="description p-4">
                                    Кастомизация цветов и тем оформления меню
                                    </p>

                                <p className="description p-4">

                                    Меню доступно как в веб версии так и в приложении Android и Iphone
                                </p>
                                <div className="actionBtn p-4 mt-2">
                                    <button id="openLeaveMessage4"
                                        className=" openLeaveMessage mr-4 p-3 rounded-xl border-2 border-gray-800">
                                        Скачать приложение (скоро)
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* <!-- five  block  --> */}
                    <section className="max-w-6xl m-auto my-20 md:my-20 p-2 ">
                        <div className="md:flex justify-evenly bg-white rounded-xl md:bg-transparent">
                            <div className="left md:w-1/2 p-6 ">
                                <span className="prehead p-4">
                                    {/* <!-- Lets try for free --> */}
                                </span>
                                <h1 className="heading p-4 text-5xl">
                                    Доступно везде
                                </h1>
                                <p className="description p-4">Доступ и управление с любого устройства</p>
                                <p className="description p-4">Работает на нескольких языках</p>
                                <p className="description p-4">
                                    Синхронизация данных между всеми устройствами
                                </p>
                                <div className="actionBtn p-4 mt-2">
                                    <button id="openLeaveMessage5"
                                        className="hidden  openLeaveMessage mr-4 p-3 rounded-xl border-2 border-gray-800">
                                        Узнать больше
                                    </button>
                                </div>
                            </div>
                            <div className="right md:w-1/2">
                                <img alt="Доступ к админ панели с любого устройства" className="md:p-4 m-auto border rounded-2xl shadow-2xl"
                                    src="images/png/multilanguage_admin.png " />
                            </div>

                        </div>
                    </section>

                    {/* <!-- six big block  --> */}
                    <section className="max-w-6xl m-auto mb- 20 mt-48 md:my-48 p-2 ">
                        <div className=" md:flex justify-evenly bg-white rounded-xl">
                            <div className="1/2part md:w-1/2 p-2">
                                <div className="relative -z-1 -top-36">
                                    <img alt="Оптимизировано для управления с любого устройства" className="p-4 m-auto rounded-2xl border" src="/images/png/optimization_admin.png"></img>
                                    <h1 className="heading p-4 md:text-7xl text-4xl">
                                        {/* <!-- Три простых шага чтобы начать пользоваться преемуществом перед конкурентами --> */}
                                        Просто и понятно
                                    </h1>
                                    <div className="description p-4">
                                        Админка имеет все что необходимо для работы, без излишеств
                                    </div>
                                    <p className="description p-4">Оптимизировано под любые устройства
                                    </p>
                                    <p className="description p-4">Бесплатная консультация по любым вопроса по телефону ниже
                                    </p>
                                    <div className="actionBtn p-4 mt-2">
                                        <button id="openLeaveMessage6"
                                            className=" openLeaveMessage mr-4 p-3 rounded-xl text-white bg-blue-500 text-xl">
                                             +373 605 499 95
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="1/2part md:w-1/2 md:px-10 md:pt-10">
                                <h1 className="heading p-4 text-5xl">
                                    Шаг 1
                                </h1>
                                <div className="description p-4">Выбери локацию твоего ресторана</div>
                                {/* <hr className="md:mb-20"> */}
                                <h1 className="heading p-4 text-5xl">
                                    Шаг 2
                                </h1>
                                <div className="description p-4">Настрой время и зону доставки</div>
                                {/* <hr className="md:mb-20"> */}
                                <h1 className="heading p-4 text-5xl">
                                    Шаг 3
                                </h1>
                                <div className="description p-4">Заполни меню вручную либо возпользуйся API если уже есть меню в элекронном варианте</div>
                                <h1 className="heading p-4 text-5xl">
                                    Шаг 4
                                </h1>
                                <div className="description p-4">Принимай заказы клиентов, из приложения или веб версии вашего меню.</div>
                                {/* <hr className="md:mb-20"> */}
                            </div>
                        </div>
                    </section>

                </div>
                </div>

        </wrapper>
        </div>
    );
};

export default FirstInfoBlock;
