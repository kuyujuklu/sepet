import CarouselSection from "../landing/Carousel/CarouselSection"
import FirstInfoBlock from "./Main/FirstInfoBlock"
import SecondInfoBlock from "./Main/SecondInfoBlock"
import Header from "../landing/Header"

import style from '../landing/sass/components/company-inline-select/company-inline-select.module.scss'
import Link from "next/link"

export const metadata = {
  title: "Sandex POS  Moldova",
  description: "Sandex POS. Site de livrare rapida pentru cafenele. Curier pentru un restaurant. Administrarea restaurantului. Optimizarea functionarii unitatii.",
}

const page = () => {
  return (
    <div style={{ maxWidth: 1280 }} className="mx-auto pb-10">
      <header className="block mb-16 sm:mb-20">
        <Header lang="ro" />
      </header>
      <section>
        <CarouselSection />
      </section>
      <section className="block mt-4 sm:mt-16">
        <FirstInfoBlock />
      </section>
      <section className="block mt-4">
        <SecondInfoBlock />
      </section>
      <section className="text-center block mt-4">
        <a className="bg-slate-300 text-xl font-medium p-4 rounded-xl" href="https://sandex.md/pricing.html">Produsele noastre și prețurile</a>
      </section>

      <section className="block mt-4 sm:mt-16">
        <div className="flex flex-col items-center w-fit m-auto">
          <h1 className="text-center text-2xl text-gray-800 font-bold mb-4">Înscrieți-vă și primiți orice tarif pentru o lună absolut gratuit</h1>
          <div className="text-center flex flex-col sm:flex-row items-center gap-x-6 gap-y-2">
            <div className="flex gap-4 ">
              <Link href="/admin/auth/registration?tariff=basic"
                className={`${style.inlineSelectItem} border-2 border-gray-800 shadow-2xl`}
              >
                Basic
              </Link>
              <Link href="/admin/auth/registration?tariff=pro"
                className={`${style.inlineSelectItem} border-2 border-gray-800 shadow-2xl`}
              >
                Pro
              </Link>
              <Link href="/admin/auth/registration?tariff=business"
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