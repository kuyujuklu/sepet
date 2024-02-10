import Image from "next/image";

const SecondInfoBlock = () => {
    return (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-8 p-4">
            <section className="flex gap-10 border rounded-2xl shadow-2xl p-4" style={{maxWidth: "500px"}}>
                <div className="w-fit ml-2">
                    <h1 className="mb-6 text-2xl text-gray-800 font-medium">
                        Выгодно
                    </h1>
                    <div className="flex flex-col gap-4">
                        <p className="text-lg mb-4">Предлагай скидки</p>
                        <p>
                            Включайте скидки для определенных товаров или категорий
                            чтобы продать больше....
                        </p>
                        <p>Кстати Клиенты такое любят)))</p>
                    </div>
                </div>
                <div className={`shadow-2xl relative hidden sm:flex`} style={{minWidth:"200px", aspectRatio: 395/504, position: "relative"}}>
                    <Image
                        className={`rounded-2xl`}
                        style={{ objectFit: "cover" }}
                        fill
                        src="/images/png/dont-waste-time.png"
                        alt="image"
                    />
                </div>
            </section>
            <section className="flex gap-10 border rounded-2xl shadow-2xl p-4" style={{maxWidth: "500px"}}>
                <div className="w-fit ml-2">
                    <h1 className="mb-6 text-2xl text-gray-800 font-medium">
                    Удобно
                    </h1>
                    <div className="flex flex-col gap-4">
                        <p>
                            Приложение оптимизировно под любые устройства 
                        </p>
                        <p>Держи все под контролем с мобильного устройства даже когда в отъезде и нет возможности находится в ресторане</p>
                    </div>
                </div>
                <div className={`shadow-2xl relative hidden sm:flex`} style={{minWidth:"200px", aspectRatio: 395/504, position: "relative"}}>
                    <Image
                        className={`rounded-2xl`}
                        style={{ objectFit: "cover" }}
                        fill
                        src="/images/png/optimized-for-mobile.jpg"
                        alt="image"
                    />
                </div>
            </section>
        </div>
    );
};

export default SecondInfoBlock;
