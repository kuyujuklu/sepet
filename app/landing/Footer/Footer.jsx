"use client"

import Link from "next/link"

const Footer = () => {


  return (
    <div style={{
      backgroundColor: 'rgb(255 255 255 / 27%)'
    }} className="w-full flex flex-col sm:flex-row gap-5 sm:gap-10 justify-center items-center bg-white pt-10 pb-10 px-10 shadow-lg rounded-tl-xl rounded-tr-xl" >
      <ul className="flex flex-col gap-2">
        <span className="text-xl">Свяжитесь с нами</span>
        <span>Email: mdsandex@gmail.com</span>
        <span>Telegram: @AlternativeGE</span>
        <span>Instagram: @Sepet.md</span>


      </ul>
      <ul className="flex flex-col gap-3">
        <li><Link className="cursor-pointer hover:underline" href="https://sepet.md/admin/company">Для заведений</Link></li>
        <li><Link className="cursor-pointer hover:underline" href="https://sepet.md/courier">Для курьеров</Link></li>
        <li><Link className="cursor-pointer hover:underline" href="https://jivo.chat/jlF5Cg69We">Поддержка</Link></li>
      </ul>

    </div >

  );
};

export default Footer;


