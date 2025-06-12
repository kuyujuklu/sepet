import Header from "./landing/Header"
import CarouselSection from "./landing/Carousel/CarouselSection"
import FirstInfoBlock from "./landing/Main/ChooseLocation"
import SecondInfoBlock from "./landing/Main/SecondInfoBlock"

import style from './landing/sass/components/company-inline-select/company-inline-select.module.scss'
import Link from "next/link"
import Main from "./landing/Main/Main"


const page = () => {
  return (
    <div style={{ maxWidth: 1280 }} className="mx-auto px-4 pb-10">
      <header className="block mb-5">
        <Header lang="ru" />
      </header>
      <section className="block mt-4">
        <Main />
      </section>
    </div>
  )
}

export default page
