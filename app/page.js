import Header from "./landing/Header"
import CarouselSection from "./landing/Carousel/CarouselSection"
import FirstInfoBlock from "./landing/Main/FirstInfoBlock"
import SecondInfoBlock from "./landing/Main/SecondInfoBlock"

import style from './admin/sass/components/company-inline-select/company-inline-select.module.scss'
import Link from "next/link"

const page = () => {
    return (
      <div style={{maxWidth: 1280}} className="mx-auto pb-10">
        <header className="block mb-16 sm:mb-20">
          <Header />
        </header>
        <section>
          <CarouselSection />
        </section>
        <section className="block mt-4 sm:mt-16">
          <FirstInfoBlock />
        </section>
        <section className="block mt-4 sm:mt-16">
          <SecondInfoBlock />
        </section>

        <section className="block mt-4 sm:mt-16">
        <div className="flex flex-col items-center w-fit m-auto">
            <h1 className="text-center text-2xl text-gray-800 font-bold mb-4">Зарегистрируйся и получи любой тариф на месяц абсолютно бесплатно</h1>
            <div className="text-center flex flex-col sm:flex-row items-center gap-x-6 gap-y-2">
                <div className="flex gap-4 ">
                    <Link href="/admin/auth/registration?tariff=basic"
                        className={`${style.inlineSelectItem} border-2 border-gray-800 shadow-2xl`}
                    >
                      Basic
                    </Link>
                    <Link  href="/admin/auth/registration?tariff=pro"
                        className={`${style.inlineSelectItem} border-2 border-gray-800 shadow-2xl`}
                    >
                      Pro
                    </Link>

                    <Link  href="/admin/auth/registration?tariff=business"
                        className={`${style.inlineSelectItem} border-2 border-gray-800 shadow-2xl`}
                    >
                      Business
                    </Link>
                </div>
            </div>
        </div>
        </section>
      </div>
    )
  }
  
  export default page