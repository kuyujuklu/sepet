import style from "../sass/index.module.scss";
const FirstInfoBlock = () => {
    return (
        <div className={`${style.wrap} text-center mb-20`}>
            <div className="relative mb-2">Доставка в:<select className="bg-blue-400 rounded-md m-2">
                <option>Казаклия</option>
                <option>Комрат</option>
                <option>Чадыр-Лунга</option>
                <option>Тараклия</option>
            </select></div>
            <div className="text-xl p-2 text-center"> Выбери категорию</div>
            <div className=" md:flex justify-center">
                <a><div className="p-4"><img className="object-cover transition delay-150 ease-in-out duration-750 hover:-translate-y-2 hover:scale-110 m-auto p-2 w-48 h-48 rounded-full animate-pulse cursor-pointer" src="/images/png/eda.jpg"  ></img></div></a>
                <a><div className="p-4"><img className="object-cover transition delay-150 ease-in-out duration-750 hover:-translate-y-2 hover:scale-110 m-auto p-2 w-48 h-48 rounded-full animate-pulse cursor-pointer" src="/images/png/flori.jpg"></img></div></a>
                <a><div className="p-4"><img className="object-cover transition delay-150 ease-in-out duration-750 hover:-translate-y-2 hover:scale-110 m-auto p-2 w-48 h-48 rounded-full animate-pulse cursor-pointer" src="/images/png/producty.jpg"></img></div></a>
            </div>
            <div className="p-2 text-xl my-4 text-center">Все рестораны</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 m-auto text-center">
                <div className="p-2 bg-blue-200 h-[150px] rounded-xl grid grid-cols-1"><span>Restaurant name *4.5</span><span>Часы работы: 10:00-20:00</span><span>Бесплатная доставка от: 300 лей</span><span></span></div>
                <div className="p-2 bg-blue-200 h-[150px] rounded-xl grid grid-cols-1"><span>Restaurant name *4.5</span><span>Часы работы: 10:00-20:00</span><span>Бесплатная доставка от: 300 лей</span><span></span></div>
                <div className="p-2 bg-blue-200 h-[150px] rounded-xl grid grid-cols-1"><span>Restaurant name *4.5</span><span>Часы работы: 10:00-20:00</span><span>Бесплатная доставка от: 300 лей</span><span></span></div>
                <div className="p-2 bg-blue-200 h-[150px] rounded-xl grid grid-cols-1"><span>Restaurant name *4.5</span><span>Часы работы: 10:00-20:00</span><span>Бесплатная доставка от: 300 лей</span><span></span></div>
                <div className="p-2 bg-blue-200 h-[150px] rounded-xl grid grid-cols-1"><span>Restaurant name *4.5</span><span>Часы работы: 10:00-20:00</span><span>Бесплатная доставка от: 300 лей</span><span></span></div>
                <div className="p-2 bg-blue-200 h-[150px] rounded-xl grid grid-cols-1"><span>Restaurant name *4.5</span><span>Часы работы: 10:00-20:00</span><span>Бесплатная доставка от: 300 лей</span><span></span></div>
            </div>
        </div>
    );
};

export default FirstInfoBlock;
