import Image from "next/image";
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
                                    Luați comenzi online
                                </span>
                                <h1 className="heading p-4 md:text-7xl text-5xl">
                                    Terminalul optimizează procesele 
                                </h1>
                                <p className="description p-4">
                                    Cu alerte "în timp real" și actualizări ale listei de comenzi, lucrătorii nu vor rata niciodată o nouă comandă.
                                </p>
                                <p className="description p-4">
                                    Totul pentru a simplifica procesele de lucru.
                                </p>
                                    <ul className="p-4 m-2">
                                        <li className="mb-6">Bucătarii evaluează instantaneu disponibilitatea ingredientelor pentru a pregăti comanda și încep să o gătească imediat....</li>
                                        <li className="mb-6">Curierii văd când se termină gătitul și trebuie să vină să ridice comanda....</li>
                                        <li className="mb-6">Administratorul monitorizează calitatea și viteza de pregătire și de livrare a comenzilor....</li>
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
                                <img alt="Procesarea comenzilor online în panoul de administrare" className="m-auto border rounded-2xl shadow-2xl"
                                    src="/images/png/order_admin.png" />
                            </div>
                        </div>
                    </section>

                    {/* <!-- second block  --> */}
                    <section className="max-w-6xl m-auto my-20 md:my-20 p-2 ">
                        <div className="">
                            <div className="text-center text-2xl slogan">
                                Noi aducem lucrătorii împreună în panoul de administrare
                            </div>
                            <div className="text-center logoWide p-2 m-auto">
                                <div className=" mind"></div>
                                {/* <!-- <img alt=""className="p-4 h-20" src="/" /> --> */}
                                Bucătarii pot dedica mai mult timp detaliilor unui fel de mâncare. Curierii își planifică livrările cu mai multă atenție pentru a livra totul la timp și la costuri reduse.
                            </div>
                        </div>

                        
                    </section>

                    {/* <!-- third block  --> */}
                    <section className="max-w-6xl m-auto my-36 p-2 ">
                        <div className=" md:flex justify-evenly bg-white rounded-xl">
                            <div className="1/2part md:w-1/2 p-2">
                                <h1 className="heading p-4 md:text-6xl text-5xl">
                                    Livrare inteligentă
                                </h1>
                                <div className="description p-4">Setați raza de livrare la care livrează curierii dumneavoastră.
                                </div>
                                <p className="description p-4">
                                    Rețineți metodele de plată și termenele de livrare disponibile.

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
                                <img alt="Configurarea zonei și a orei de livrare a restaurantului" className="m-auto p-4 md:relative -z-1 -top-16 border rounded-2xl shadow-2xl"
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
                                <img alt="Completarea și personalizarea meniului electronic" className="m-auto border rounded-2xl shadow-2xl"
                                    src="/images/png/menu_admin.png" />
                            </div>
                            <div className="left md:w-1/2 p-2 ">
                                <span className="prehead p-4"></span>
                                <h1 className="heading p-4 text-5xl">
                                    Meniu ușor de utilizat
                                </h1>
                                <p className="description p-4">
                                    Editați cu ușurință articolele și actualizați fotografiile alimentelor oricând doriți

                                </p>
                                <p className="description p-4">
                                    Personalizarea culorilor și a temelor din designul meniului
                                    </p>

                                <p className="description p-4">

                                    Meniul este disponibil atât în versiunea web, cât și în aplicația pentru Android și Iphone.
                                </p>
                                <div className="actionBtn p-4 mt-2">
                                    <button id="openLeaveMessage4"
                                        className=" openLeaveMessage mr-4 p-3 rounded-xl border-2 border-gray-800">
                                        Descărcați aplicația (în curând)
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
                                    Disponibil peste tot
                                </h1>
                                <p className="description p-4">Acces și control de pe orice dispozitiv</p>
                                <p className="description p-4">Funcționează în mai multe limbi</p>
                                <p className="description p-4">
                                    Sincronizarea datelor între toate dispozitivele
                                </p>
                                <div className="actionBtn p-4 mt-2">
                                    <button id="openLeaveMessage5"
                                        className="hidden  openLeaveMessage mr-4 p-3 rounded-xl border-2 border-gray-800">
                                        Citește mai mult
                                    </button>
                                </div>
                            </div>
                            <div className="right md:w-1/2">
                                <img alt="Acces la panoul de administrare de pe orice dispozitiv" className="md:p-4 m-auto border rounded-2xl shadow-2xl"
                                    src="images/png/multilanguage_admin.png " />
                            </div>

                        </div>
                    </section>

                    {/* <!-- six big block  --> */}
                    <section className="max-w-6xl m-auto mb- 20 mt-48 md:my-48 p-2 ">
                        <div className=" md:flex justify-evenly bg-white rounded-xl">
                            <div className="1/2part md:w-1/2 p-2">
                                <div className="relative -z-1 -top-36">
                                    <img alt="Optimizat pentru control de pe orice dispozitiv" className="p-4 m-auto rounded-2xl border" src="/images/png/optimization_admin.png"></img>
                                    <h1 className="heading p-4 md:text-7xl text-4xl">
                                        Simplu și clar
                                    </h1>
                                    <div className="description p-4">
                                        Administratorul are tot ce ai nevoie pentru a lucra, fără complicații.
                                    </div>
                                    <p className="description p-4">Optimizat pentru toate dispozitivele
                                    </p>
                                    <p className="description p-4">Consultanță gratuită pentru orice întrebare la numărul de telefon de mai jos
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
                                    Pasul 1
                                </h1>
                                <div className="description p-4">Alegeți locația restaurantului dvs.</div>
                                {/* <hr className="md:mb-20"> */}
                                <h1 className="heading p-4 text-5xl">
                                    Pasul 2
                                </h1>
                                <div className="description p-4">Stabiliți ora și zona de livrare</div>
                                {/* <hr className="md:mb-20"> */}
                                <h1 className="heading p-4 text-5xl">
                                    Pasul 3
                                </h1>
                                <div className="description p-4">Completați meniul manual sau utilizați API dacă există deja un meniu electronic.</div>
                                <h1 className="heading p-4 text-5xl">
                                    Pasul 4
                                </h1>
                                <div className="description p-4">Acceptați comenzile clienților, din aplicația sau versiunea web a meniului dumneavoastră.</div>
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
