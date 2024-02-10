import Image from "next/image";
import style from "../sass/index.module.scss";
const FirstInfoBlock = () => {
    return (
        <div className={`${style.firstInfoBlock} text-center md:text-left border rounded-2xl shadow-2xl`}>
            {/* first half */}
            <div className={style.firstInfoBlock__left}>
                <h1 className="mb-8 md:mb-16 text-2xl text-gray-800 font-medium ">
                    Не теряй времени
                </h1>
                <p className="flex flex-col gap-6 font-medium">
                    <span>
                        Клиенты могут заказать через QR меню не дожидаясь
                        официанта
                    </span>
                    <span className="mb-4">
                        Повар может начать готовить заказ сразу после
                        публикации.
                    </span>
                    <span>
                        Если клиент очень голодный может заказать даже по пути в
                        ресторан)))
                    </span>
                </p>
            </div>
            {/* second half */}
            <div className={`${style.firstInfoBlock__right}`} style={{minWidth: 300}}>
                <div className="shadow-2xl" style={{width: "100%", aspectRatio: 395/504, position: "relative"}}>
                    <Image
                        className="rounded-2xl"
                        style={{ objectFit: "cover" }}
                        fill
                        src="/images/png/sales.png"
                        alt="image"
                    />
                </div>
            </div>
        </div>
    );
};

export default FirstInfoBlock;
