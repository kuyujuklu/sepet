import Header from "./landing/Header"
import CarouselSection from "./landing/Carousel/CarouselSection"
import FirstInfoBlock from "./landing/Main/ChooseLocation"
import SecondInfoBlock from "./landing/Main/SecondInfoBlock"

import style from './landing/sass/components/company-inline-select/company-inline-select.module.scss'
import Link from "next/link"
import Main from "./landing/Main/Main"
import Footer from "./landing/Footer/Footer.jsx"


const page = () => {
  return (
    <div style={{ maxWidth: 1280, height: "100vh" }} className="flex flex-col mx-auto px-4 ">
      <header className="block mb-5">
        <Header />
      </header>
      <section className="block mt-4" style={{ flexGrow: 1 }}>
        <Main />
      </section>
      <section className="block mt-4">
        <Footer />
      </section>
    </div>
  )
}

export default page
