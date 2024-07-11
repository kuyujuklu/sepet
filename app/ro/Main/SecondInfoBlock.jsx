import Image from "next/image";

const SecondInfoBlock = () => {
    return (
        <div className="">
            <section className="max-w-6xl m-auto my-2 md:my-2 p-2">
                <div className="p-4 text-center">
                    <h1 className="text-xl">Proiectele noastre</h1>
                </div>
                <div className="p-4 text-center">
                </div>
                <div className=" my-10 mt-2 ">
                    <div className="priductImage  flex md:py-6 md:p-2 gap-10 overflow-auto">
                        <img alt="Qr menu screenshots 1" src="/images/png/parkcafe_present.png"
                className="w-[335px] md:w-[400px] rounded-xl"></img>
                        <img alt="Qr menu screenshots 1" src="/images/png/redstar_present.png"
                className="w-[335px] md:w-[400px] rounded-xl"></img>
                        <img alt="Qr menu screenshots 1" src="/images/png/ikramcafe_present.png"
                className="w-[335px] md:w-[400px] rounded-xl"></img>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SecondInfoBlock;
